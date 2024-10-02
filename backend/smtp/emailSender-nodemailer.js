const nodemailer = require('nodemailer');

// Function to send email using Nodemailer
const sendEmail = async (to, opravilo, recipientName, enota) => {
    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, 
        auth: {
            user: 'gajkorosec58@gmail.com',
            pass: 'psel wnkr mnpq iziv',
        },
    });

    // Verify connection
    transport.verify((err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Nodemailer with Gmail is ready to process mails.');
        }
    });

    // Construct email message
    const message = `Pozdravljen ${recipientName}, imate neopravljeno opravilo: ${opravilo} v enoti: ${enota}`;

    // Send email
    transport.sendMail({
        from: "gajkorosec58@gmail.com",
        to: "kdo.danes@gmail.com",
        subject: "Neopravljeno opravilo",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Neopravljeno opravilo</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                }
                .header img {
                    max-width: 100px;
                }
                .header .title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-top: 10px;
                    color: #333333;
                }
                .content {
                    padding: 20px 0;
                    font-size: 18px;
                    line-height: 1.6;
                    color: #555555;
                }
                .content b {
                    color: #d9534f; /* Highlighted text in red */
                }
                .footer {
                    text-align: center;
                    padding: 20px 0;
                    font-size: 14px;
                    color: #777777;
                    border-top: 1px solid #dddddd;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #007bff;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <a class="navbar-brand" href="index">
                        <img src="https://t4.ftcdn.net/jpg/02/80/07/69/360_F_280076925_VIyaQvZMh39ipqZFTE9g6bqPEDP8ZlTv.jpg" alt="logo" class="logo" id="logo" />
                        <span class="title">KdoDanesPospravlja</span>
                    </a>
                </div>
                <div class="content">
                    <p>${message}</p>
                </div>
                <div class="footer">
                    <p>© 2024 KdoDanesPospravlja.si</p>
                </div>
            </div>
        </body>
        </html>
        `,
        text: message,
    }, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
};

// Export the sendMail function
module.exports = sendEmail;
