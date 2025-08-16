import sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "SendGrid API key is missing" },
            { status: 500 }
        );
    }

    sgMail.setApiKey(apiKey);

    const body = await req.json();
    const { to, from, subject, text, html } = body;

    try {
        const msg = {
            to: to,
            from: from,
            subject: subject,
            text: text,
            html: html,
        };

        await sgMail.send(msg);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("SendGrid Error:", error?.response?.body || error);
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        );
    }
}
