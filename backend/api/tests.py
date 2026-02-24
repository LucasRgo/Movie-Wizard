from django.test import TestCase
from rest_framework.test import APIClient


class AuthFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_logs_user_in_for_immediate_user_endpoint_access(self):
        register_response = self.client.post(
            "/api/register/",
            {"username": "newuser", "password": "test-pass-123"},
            format="json",
        )

        self.assertEqual(register_response.status_code, 201)
        self.assertIn("sessionid", register_response.cookies)

        user_response = self.client.get("/api/user/")
        self.assertEqual(user_response.status_code, 200)
        self.assertEqual(user_response.json().get("username"), "newuser")
