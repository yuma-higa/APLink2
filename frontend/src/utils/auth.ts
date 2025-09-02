import {type UserRole} from "../types/auth";

const base64UrlDecode = (str: string): string => {
    // Base64 URLセーフ文字を標準Base64に変換
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // パディングを追加
    while (base64.length % 4) {
        base64 += '=';
    }
    
    // ブラウザ環境でのみatobを使用
    if (typeof window !== 'undefined') {
        return window.atob(base64);
    }
    
    // Node.js環境（開発時など）
    return Buffer.from(base64, 'base64').toString('utf-8');
};

export const decodeToken = (token: string): {name: string; role: UserRole} | null => {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;

        const decoded = JSON.parse(base64UrlDecode(payload));
        
        
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            console.warn("Token has expired");
            return null;
        }
        
        
        if (!decoded.name || !decoded.role) {
            console.warn("Token missing required fields");
            return null;
        }
        
        return {
            name: decoded.name,
            role: decoded.role
        };
    } catch (error) {
        console.error("Token decode error:", error);
        return null;
    }
}

export const getUserRole = (): UserRole | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded) {
    
    localStorage.removeItem('accessToken');
    return null;
  }
  
  return decoded.role;
};

export const logout = (): void => {
  localStorage.removeItem('accessToken');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
 
  const decoded = decodeToken(token);
  if (!decoded) {
    
    localStorage.removeItem('accessToken');
    return false;
  }
  
  return true;
};