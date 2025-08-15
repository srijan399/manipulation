"use client";
import { Button } from "@/components/ui/button";

const EmailSendPage = () => {
    //     const handleSend = async () => {
    //         console.log("Sending email...");
    //         const sgMail = require("@sendgrid/mail");
    //         sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    //         const msg = {
    //             to: "happilyobnoxious0@gmail.com",
    //             from: "srijanstorage5@gmail.com",
    //             subject: "Bank Fraud Alert",
    //             text: `Subject: 🚨 URGENT: Suspicious Activity Detected on Your Galactic Credit Account 🚨

    // Body:

    // Dear Prayas,

    // We regret to inform you that our security hamsters detected highly suspicious intergalactic transactions from your account at Interstellar Trust Bank.

    // Suspicious charges include:

    // 47 crates of space bananas from Planet Zog

    // A lifetime supply of glow-in-the-dark socks

    // A suspiciously large cheese wheel shipped to the Moon

    // Failure to confirm these purchases within 24 space hours will result in:

    // Your account being frozen in carbonite

    // The Galactic Council sending you sternly worded holograms

    // Possible teleportation to the Bureau of Cosmic Misunderstandings

    // Click here to verify your account immediately: https://r.mtdv.me/o2I75UQobd

    // May the funds be with you,
    // Captain Ledger
    // Chief of Space Security
    // Interstellar Trust Bank 🚀`,
    //             html: "<strong></strong>",
    //         };
    //         //ES6
    //         sgMail.send(msg).then(
    //             () => {},
    //             (error: any) => {
    //                 console.error(error);

    //                 if (error.response) {
    //                     console.error(error.response.body);
    //                 }
    //             }
    //         );
    //     };
    return (
        <div>
            <h1>Email Send Page</h1>
            <Button>Send Email</Button>
        </div>
    );
};

export default EmailSendPage;
