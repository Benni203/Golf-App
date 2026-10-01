import os
import filecmp
import unittest
from app import app
from build_frontend import EXPECTED_MODULES

class TestFrontendModular(unittest.TestCase):
    def setUp(self):
        self.repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.js_dir = os.path.join(self.repo_root, "js")
        self.www_js_dir = os.path.join(self.repo_root, "www", "js")
        self.index_html = os.path.join(self.repo_root, "index.html")
        self.www_index_html = os.path.join(self.repo_root, "www", "index.html")
        self.sw_js = os.path.join(self.repo_root, "sw.js")
        self.client = app.test_client()

    def test_all_modules_exist_and_non_empty(self):
        for mod in EXPECTED_MODULES:
            src = os.path.join(self.js_dir, mod)
            self.assertTrue(os.path.isfile(src), f"Module missing in js/: {mod}")
            self.assertGreater(os.path.getsize(src), 50, f"Module empty in js/: {mod}")

    def test_www_parity_files(self):
        # index.html parity
        self.assertTrue(filecmp.cmp(self.index_html, self.www_index_html, shallow=False),
                        "index.html and www/index.html are not in sync!")

        # js/ modules parity
        for mod in EXPECTED_MODULES:
            src = os.path.join(self.js_dir, mod)
            dst = os.path.join(self.www_js_dir, mod)
            self.assertTrue(os.path.isfile(dst), f"Module missing in www/js/: {mod}")
            self.assertTrue(filecmp.cmp(src, dst, shallow=False),
                            f"Parity mismatch between js/{mod} and www/js/{mod}!")

    def test_flask_serves_all_modules(self):
        for mod in EXPECTED_MODULES:
            res = self.client.get(f"/js/{mod}")
            self.assertEqual(res.status_code, 200, f"Flask failed to serve /js/{mod}")
            self.assertGreater(len(res.data), 50, f"/js/{mod} returned empty response")
            res.close()

    def test_index_html_modular_script_tags(self):
        with open(self.index_html, "r", encoding="utf-8") as f:
            content = f.read()

        line_count = len(content.splitlines())
        # The monolithic index.html had ~7674 lines; the modular version should be well under 3500 lines
        self.assertLess(line_count, 3500, f"index.html has {line_count} lines, expected < 3500")

        for mod in EXPECTED_MODULES:
            tag = f'<script src="js/{mod}"></script>'
            self.assertIn(tag, content, f"Script tag missing in index.html: {tag}")

    def test_service_worker_caches_all_modules(self):
        with open(self.sw_js, "r", encoding="utf-8") as f:
            content = f.read()

        for mod in EXPECTED_MODULES:
            entry = f"'/js/{mod}'"
            self.assertIn(entry, content, f"Module missing in sw.js STATIC_ASSETS: {entry}")

if __name__ == '__main__':
    unittest.main()
