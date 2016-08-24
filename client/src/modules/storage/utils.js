const Base64 = require('js-base64').Base64;

export const storageToHash = (storage) => {
  return Base64.encode(storage.address);
};

export const hashToStorageAddress = (hash) => {
  return Base64.decode(hash);
}
