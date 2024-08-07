import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

const transporter = nodemailer.createTransport({
    service: "Zoho",
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
        user: "di2kashter@gmail.com",
        pass: "Bismillah~~``!!11",
    },
    requireTLS: true,

});

const send = async ({
    to,
    subject,
    content
}: {
    to: string | string[];
    subject: string;
    content: string;
}) => {
    try {
        const result = await transporter.sendMail({
            from: "imdidiksetiawan@zohomail.com",
            to,
            subject,
            html: content,
        });
        console.log(to);
        return result;
        
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw the error after logging
    }
};

const render = async (template: string, data: any) => {
    try {
        const templatePath = path.join(__dirname, `templates/${template}`);
        const content = await ejs.renderFile(templatePath, data);
        return content as string;
    } catch (error) {
        console.error('Error rendering template:', error);
        throw error;
    }
};

export default {
    send,
    render,
};