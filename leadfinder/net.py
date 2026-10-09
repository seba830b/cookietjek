"""Shared HTTP plumbing: a polite session, a per-host rate limiter and a
small JSON file cache so reruns don't hit the network again."""

import hashlib
import json
import os
import time
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import requests


class Cache:
    """Stores JSON-able values in one file per key, with an expiry in days."""

    def __init__(self, folder, days, enabled=True):
        self.folder = folder
        self.max_age = days * 86400
        self.enabled = enabled
        os.makedirs(folder, exist_ok=True)

    def _path(self, namespace, key):
        digest = hashlib.sha1(key.encode("utf-8")).hexdigest()
        return os.path.join(self.folder, f"{namespace}-{digest}.json")

    def get(self, namespace, key):
        path = self._path(namespace, key)
        if not self.enabled or not os.path.exists(path):
            return None
        if time.time() - os.path.getmtime(path) > self.max_age:
            return None
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    def set(self, namespace, key, value):
        with open(self._path(namespace, key), "w", encoding="utf-8") as f:
            json.dump(value, f, ensure_ascii=False)


class PoliteSession:
    """requests.Session with a user agent, a timeout, a minimum gap
    between requests to the same host and optional robots.txt checks."""

    def __init__(self, user_agent, min_gap, timeout, respect_robots=True):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": user_agent,
            "Accept-Language": "da,en;q=0.8",
        })
        self.user_agent = user_agent
        self.min_gap = min_gap
        self.timeout = timeout
        self.respect_robots = respect_robots
        self._last_hit = {}   # host -> timestamp of last request
        self._robots = {}     # host -> RobotFileParser (or None if unreadable)

    def _wait_for(self, url):
        host = urlparse(url).netloc
        gap = time.time() - self._last_hit.get(host, 0)
        if gap < self.min_gap:
            time.sleep(self.min_gap - gap)
        self._last_hit[host] = time.time()

    def allowed(self, url):
        """True if robots.txt lets us fetch this URL (or has no opinion)."""
        if not self.respect_robots:
            return True
        parts = urlparse(url)
        base = f"{parts.scheme}://{parts.netloc}"
        if base not in self._robots:
            parser = RobotFileParser()
            try:
                self._wait_for(base)
                resp = self.session.get(base + "/robots.txt", timeout=self.timeout)
                parser.parse(resp.text.splitlines() if resp.status_code == 200 else [])
            except requests.RequestException:
                parser.parse([])  # no robots.txt reachable: allowed
            self._robots[base] = parser
        return self._robots[base].can_fetch(self.user_agent, url)

    def get(self, url, **kwargs):
        self._wait_for(url)
        kwargs.setdefault("timeout", self.timeout)
        return self.session.get(url, **kwargs)

    def post(self, url, **kwargs):
        self._wait_for(url)
        kwargs.setdefault("timeout", self.timeout)
        return self.session.post(url, **kwargs)
