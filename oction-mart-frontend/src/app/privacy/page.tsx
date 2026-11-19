"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-700">Privacy Policy</h1>

      <Card className="max-w-4xl mx-auto p-6 shadow-lg">
        <CardContent className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p>
              Welcome to Oction Mart. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
            <ul className="list-disc list-inside">
              <li>Personal information such as your name, email address, and contact details.</li>
              <li>Account credentials and authentication data.</li>
              <li>Transaction history and auction activity.</li>
              <li>Device and usage data for improving our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
            <p>
              We use your information to provide, improve, and personalize your experience on Oction Mart, including:
            </p>
            <ul className="list-disc list-inside">
              <li>Processing auctions and payments.</li>
              <li>Communicating important updates and notifications.</li>
              <li>Improving platform functionality and security.</li>
              <li>Analyzing trends to enhance user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Data Sharing</h2>
            <p>
              We do not sell or rent your personal information. We may share your data only with trusted service providers necessary to operate the platform and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information against unauthorized access, loss, or alteration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information. You may also opt out of promotional communications at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@octionmart.com" className="text-blue-600 underline">support@octionmart.com</a>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
