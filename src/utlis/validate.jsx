export const checkValidateForm = (email, password) => {

    const isemailvalid = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    const ispasswordvalid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);

    if(!isemailvalid) return "Email is not Valid";
    if(!ispasswordvalid) return "Password is not Valid";

    return null;

};