import { Kafka, Consumer, Producer } from 'kafkajs';
import avro from 'avsc';

class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(brokers: string[]) {
    this.kafka = new Kafka({
      brokers: brokers,
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'seat-reservation-group' });
  }

  async connectProducer() {
    await this.producer.connect();
  }

  async connectConsumer() {
    await this.consumer.connect();
  }

  async produce(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });
  }

  async consume(topic: string, callback: (message) => void) {
    await this.consumer.subscribe({ topic: topic });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        callback(message.value);
      },
    });
  }

  async disconnect() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }
}

const kafkaService = new KafkaService(['localhost:9092']);

export default kafkaService;
