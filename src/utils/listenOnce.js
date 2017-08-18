const listenOnce = (element, eventType, handler) => {
  element.addEventListener(eventType, function once(event) {
    event.target.removeEventListener(event.type, once);
    return handler(event);
  });
};

export default listenOnce;
