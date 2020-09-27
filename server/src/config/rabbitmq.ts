import { connect, Message } from "amqplib/callback_api";
import { createHash } from "crypto";

export interface RabbitMQ {
  queueName: string;
  json: Record<string, any>;
}

export class RabbitMQ {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}
  static rpc(input: RabbitMQ): void {
    connect("amqp://localhost", function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }
        channel.assertQueue(
          "",
          {
            exclusive: true,
          },
          function (error2, q) {
            if (error2) {
              throw error2;
            }
            const correlationId = createHash("md5")
              .update("Man oh man do I love node!")
              .digest("hex");

            channel.consume(
              q.queue,
              (msg: any) => {
                if (msg.properties.correlationId == correlationId) {
                  console.log(" [.] Got %s", msg.content.toString());
                  setTimeout(function () {
                    connection.close();
                    process.exit(0);
                  }, 500);
                }
              },
              {
                noAck: true,
              }
            );

            channel.sendToQueue(input.queueName, Buffer.from(input.json), {
              correlationId: correlationId,
              replyTo: q.queue,
            });
          }
        );
      });
    });
  }
}
