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

    try {
        const msg = {
            to: "anjalipandaacs@gmail.com",
            from: "happilyobnoxious0@gmail.com",
            subject: "Teri mummy ki jay kya cheez banai",
            text: "bakchod hahahah",
            html: `
            <h1>Hello Anjali Danda!!!</h1>
            <p>Date pe chalna hain?</p>
            `,
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
