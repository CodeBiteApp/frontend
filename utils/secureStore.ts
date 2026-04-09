import * as SecureStore from "expo-secure-store";

// save Token
async function saveSecureStore(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

// get Token
async function getSecureStore(key: string) {
  const storedData = (await SecureStore.getItemAsync(key)) ?? null;

  return storedData;
}

// delete Token
async function deleteSecureStore(key: string) {
  await SecureStore.deleteItemAsync(key);
}

export { deleteSecureStore, getSecureStore, saveSecureStore };
