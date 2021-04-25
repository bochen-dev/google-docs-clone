require('custom-env').env();

const admin = require('firebase-admin');

const serviceAccount = require('./firebase-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const io = require('socket.io')(process.env.PORT || 3001, {
  cors: {
    origin: process.env.FRONTEND_SERVER,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`<${socket.id}> connected`);

  socket.on('disconnect', () => {
    console.log(`<${socket.id}> disconnected`);
  });

  socket.on('get-document', async (documentId) => {
    const data = await findOrCreateDocument(documentId);
    console.log(`Document<${documentId}> data`, data);

    socket.join(documentId);
    console.log(`<${socket.id}> joined room [${documentId}]`);

    socket.emit('load-document', data.content);

    socket.on('send-changes', (delta) => {
      console.log(`[${documentId}] send-changes::delta`, delta);

      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on('save-document', async (data) =>
      await updateDocument(documentId, data),
    );
  });
});

async function findOrCreateDocument(id) {
  if (!id) return;

  const doc = await db.collection('documents').doc(id).get();

  if (doc.exists) {
    return doc.data();
  } else {
    await db.collection('documents').doc(id).set({
      content: '',
    });

    const newDoc = await db.collection('documents').doc(id).get();

    return newDoc.data();
  }
}

async function updateDocument(id, data) {
  if (!id) return;

  const doc = db.collection('documents').doc(id);

  await doc.update({
    content: data,
  });
}
