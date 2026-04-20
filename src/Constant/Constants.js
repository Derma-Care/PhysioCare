export const emailPattern =
  /^(?=[a-zA-Z0-9._-]*[a-zA-Z])[a-zA-Z0-9._-]+@[a-zA-Z]+(?:[.-]?[a-zA-Z]+)*\.[a-zA-Z]{2,6}$/


export const getUserRole = () => localStorage.getItem('role')