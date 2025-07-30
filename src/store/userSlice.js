import { createSlice } from "@reduxjs/toolkit";

function getLocalStorageItem(key) {
  const item = localStorage.getItem(key);
  try {
    return JSON.parse(item);
  } catch (e) {
    console.error("Error parsing data from localStorage. some local storage is not loaed well");
    return null;
  }
}

// init the initial State to local and check if the user already added to cart
const userLocal = getLocalStorageItem("AuthUser");
const circleLocal = getLocalStorageItem("circle");
const sec_delLocal = getLocalStorageItem("sec_del");
const modaLocal = getLocalStorageItem("moda");
const holcLocal = getLocalStorageItem("holc");
const house_repLocal = getLocalStorageItem("house_rep");
const circleMembersLocal = getLocalStorageItem("circleMembers");
const chainOfDelegationLocal = getLocalStorageItem("chainOfDelegation");

let userInit = null;
let circleInit = null;
let sec_delInit = null;
let modaInit = null;
let holcInit = null;
let house_repInit = null;
let circleMembersInit = null;
let chainOfDelegationInit = null;

userLocal ? (userInit = userLocal) : (userInit = null);
circleLocal ? (circleInit = circleLocal) : (circleInit = null);
sec_delLocal ? (sec_delInit = sec_delLocal) : (sec_delInit = null);
modaLocal ? (modaInit = modaLocal) : (modaInit = null);
holcLocal ? (holcInit = holcLocal) : (holcInit = null);
house_repLocal ? (house_repInit = house_repLocal) : (house_repInit = null);
chainOfDelegationLocal
  ? (chainOfDelegationInit = chainOfDelegationLocal)
  : (chainOfDelegationInit = null);

circleMembersLocal ? (circleMembersInit = circleMembersLocal) : (circleMembersInit = null);

const initialState = {
  user: userInit,
  circle: circleInit,
  sec_del: sec_delInit,
  moda: modaInit,
  holc: holcInit,
  house_rep: house_repInit,
  circleMembers: circleMembersInit,
  chainOfDelegation: chainOfDelegationInit,
};

export const UserSlice = createSlice({
  name: "authUser",
  initialState,
  reducers: {
    authenticate: (state, action) => {
      state.user = action.payload;
      // add cart to localstorage
      toLocalStorage("AuthUser", state.user);
    },
    logout: (state) => {
      state.user = null;
      state.chainOfDelegation = null;
      localStorage.removeItem("AuthUser");
      localStorage.removeItem("circle");
      localStorage.removeItem("sec_del");
      localStorage.removeItem("moda");
      localStorage.removeItem("holc");
      localStorage.removeItem("house_rep");
      localStorage.removeItem("circleMembers");
      localStorage.removeItem("chainOfDelegation");
    },
    circle: (state, action) => {
      state.circle = action.payload;
      toLocalStorage("circle", state.circle);
    },
    sec_del: (state, action) => {
      state.sec_del = action.payload;
      toLocalStorage("sec_del", state.sec_del);
    },
    moda: (state, action) => {
      state.moda = action.payload;
      toLocalStorage("moda", state.moda);
    },
    holc: (state, action) => {
      state.holc = action.payload;
      toLocalStorage("holc", state.holc);
    },
    house_rep: (state, action) => {
      state.house_rep = action.payload;
      toLocalStorage("house_rep", state.house_rep);
    },
    addCirclemMembers: (state, action) => {
      state.circleMembers = action.payload;
      toLocalStorage("circleMembers", state.circleMembers);
    },
    desolveCircle: (state, action) => {
      state.circle = null;
      state.circleMembers = null;
      localStorage.removeItem("circle");
      localStorage.removeItem("circleMembers");
    },
    setChainOfDelegation: (state, action) => {
      state.chainOfDelegation = action.payload;
      toLocalStorage("chainOfDelegation", state.chainOfDelegation);
    },
  },
});

function toLocalStorage(store, user) {
  if (user === null) {
    console.log("removing from local storage fof circle");
    localStorage.removeItem(store);
  } else {
    localStorage.setItem(store, JSON.stringify(user));
  }
}

// Action creators are generated for each case reducer function
export const {
  authenticate,
  logout,
  circle,
  sec_del,
  moda,
  holc,
  house_rep,
  addCirclemMembers,
  desolveCircle,
  setChainOfDelegation,
} = UserSlice.actions;
export default UserSlice.reducer;
