declare module 'next-auth' {
    interface User {
       user: {
        id: string,
        name: string,
        email: string,
        image: string,
        role: string,
       }
    }
}