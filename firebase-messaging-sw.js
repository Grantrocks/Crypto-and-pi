// sw
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

console.log('Init');
firebase.initializeApp({
  'messagingSenderId': '513999950945'
});

const messaging = firebase.messaging();

self.addEventListener('notificationclick', e => {
	console.log(e.notification);
	let found = false;
	let f = clients.matchAll({
		includeUncontrolled: true,
		type: 'window'
	})
		.then(function (clientList) {
			for (let i = 0; i < clientList.length; i ++) {
				if (clientList[i].url === e.notification.data.click_action) {
					// We already have a window to use, focus it.
					found = true;
					clientList[i].focus();
					break;
				}
			}
			if (! found) {
				if (! e.action) {
					clients.openWindow(e.notification.data.click_action).then(function (windowClient) {});
				} else {
					switch (e.action) {
						case '1':
							clients.openWindow(e.notification.data.actions[0].link);
						case '2':
							clients.openWindow(e.notification.data.actions[1].link);
					}
				}
			}
		});
	e.notification.close();
	e.waitUntil(f);
});



// [START background_handler]
messaging.setBackgroundMessageHandler(function (payload) {

	// console.log('[firebase-messaging-sw.js] Received background message ', payload);
	
	console.log('[firebase-messaging-sw.js] Received background message');

	if (payload.data.bid_id) {
		let bid_id = payload.data.bid_id;
		fetch('https://rtb.adx1.com/log?action=pbmsgdelivered&bid-id='+bid_id)
		.then(response => console.log(response.status));
	}

	if (payload.data.id) {
		let id = payload.data.id;
		let ver = '0.2';
		fetch('https://pushbank.pushdom.co/subscriptions/web/update', {
			method: 'POST',
			body: JSON.stringify({id: id, ver: ver})
		}).then(response => console.log(response.status));
	}


	if (payload.data.actions) {
		let actionsObj = JSON.parse(payload.data.actions);
		payload.data.actions = actionsObj;
	}

	return self.registration.showNotification(payload.data.title,
		Object.assign({data: payload.data}, payload.data));


});
// [END background_handler]
