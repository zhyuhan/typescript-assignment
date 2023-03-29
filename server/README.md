# Server for the test assignment

## Description

This is a simple server that sends messages to client side using Server-Sent Events technology. Messages are sent 
with random timeout between 1 to 5 seconds and the length of the message is random between 1 to 200 symbols. 
Message structure contains three fields:

```json
{
  "msg_id": "1231-123123-123213-1232",
  "time": 1678454378,
  "msg": "This is notification message"
}
```

## How to start

To start the server simply run:

```javascript
npm install

npm start
```

Then go to http://localhost:9000/events and that's it.