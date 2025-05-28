class NotificationMeta {}

class NotificationSms extends NotificationMeta {
	message!: string;
	phone!: string;
}

class NotificationEmail extends NotificationMeta {
	message!: string;
	sender!: string;
	receivers!: string[];
	data?: Record<string, any>;
}

export class Notify {
	static async sendNotification(channel: 'sms' | 'email', meta: NotificationMeta = {}) {
		if (channel === 'sms') this.sendSms(meta as NotificationSms);
		else if (channel === 'email') this.sendEmail(meta as NotificationEmail);
	}

	static sendSms(data: NotificationSms) {
		console.log(`Sending SMS to ${data.phone}: ${data.message}`);
	}

	static sendEmail(data: NotificationEmail) {
		console.log(`Sending Email to ${data.receivers.toString()}: ${data.message}`);
	}
}
