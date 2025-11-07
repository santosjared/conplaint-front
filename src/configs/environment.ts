export default () => ({
    backendURI: process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:3001',
    URL_IOS: process.env.NEXT_PUBLIC_APP_IOS || 'http://localhost:3001',
    URL_ANDROID: process.env.NEXT_PUBLIC_APP_ANDROID || 'http://localhost:3001',
    URL_NAVEGATOR: process.env.NEXT_PUBLIC_APP_NAVEGATOR || 'http://localhost:3001',
})