import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://192.168.31.95:8090');

// 启用自动 cookie 处理
pb.autoCancellation(false);

export const isUserValid = () => {
    return pb.authStore.isValid;
};

export const getCurrentUser = () => {
    return pb.authStore.model;
};

export const logout = () => {
    pb.authStore.clear();
};