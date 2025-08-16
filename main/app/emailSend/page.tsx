"use client";
import { Button } from "@/components/ui/button";

const body = `<h3>Dear Prayas,</h3>
<div>
    We regret to inform you that our security hamsters detected highly suspicious intergalactic transactions from your account at Interstellar Trust Bank.
    <br />
    Suspicious charges include:
    <ul>
    <li>47 crates of space bananas from Planet Zog</li>

    <li>A lifetime supply of glow-in-the-dark socks</li>

    <li>A suspiciously large cheese wheel shipped to the Moon</li>
    </ul>

    <strong>Failure to confirm these purchases within 24 space hours will result in:</strong>

    <ul>
    <li>Your account being frozen in carbonite</li>
    <li>Galactic bounty hunters dispatched to your last known location</li>
    <li>The Galactic Council sending you sternly worded holograms</li>
    <li>Possible teleportation to the Bureau of Cosmic Misunderstandings</li>

    </ul>

    <br />
    <p>
    Click here to verify your account immediately: https://social.mtdv.me/articles/verify-your-account
    </p>
    </div>

    <footer>
    May the funds be with you,<br />
    Captain Ledger <br />
    Chief of Space Security <br />
    Interstellar Trust Bank
    </footer>`;

const EmailSendPage = () => {
    const handleSend = async () => {
        console.log("Sending email...");

        const content = {
            to: "prayaspal04@gmail.com",
            from: "happilyobnoxious0@gmail.com",
            subject: "Bank Fraud Alert",
            text: `Hey Prayas, we have detected suspicious activity on your account. Please verify your account immediately.`,
            html: body,
        };

        console.log("Email content:", content);
        const res = await fetch("/api/sendMail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(content),
        });
    };

    return (
        <div>
            <h1>Email Send Page</h1>
            <Button onClick={() => handleSend()}>Send Email</Button>
        </div>
    );
};

export default EmailSendPage;
