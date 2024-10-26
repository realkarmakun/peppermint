import handlebars from "handlebars";
import nodeMailer from "nodemailer";
import { prisma } from "../../../prisma";
import { createTransportProvider } from "../transport";

export async function sendTicketStatus(ticket: any) {
  const email = await prisma.email.findFirst();

  if (email) {
    const transport = await createTransportProvider();

    const testhtml = await prisma.emailTemplate.findFirst({
      where: {
        type: "ticket_status_changed",
      },
    });

    var template = handlebars.compile(testhtml?.html);
    var replacements = {
      title: ticket.title,
      status: ticket.isComplete ? "COMPLETED" : "OUTSTANDING",
    };
    var htmlToSend = template(replacements);

    await transport
      .sendMail({
        from: email?.reply, // sender address
        to: ticket.email,
        subject: `Ticket ${ticket.Number} status is now ${
          ticket.isComplete ? "COMPLETED" : "OUTSTANDING"
        }`, // Subject line
        text: `Hello there, Ticket ${ticket.Number}, now has a status of ${
          ticket.isComplete ? "COMPLETED" : "OUTSTANDING"
        }`, // plain text body
        html: htmlToSend,
      })
      .then((info: any) => {
        console.log("Message sent: %s", info.messageId);
      })
      .catch((err: any) => console.log(err));
  }
}
