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
const circleMembersLocal = getLocalStorageItem("circleMembers");

let userInit = null;
let circleInit = null;
let sec_delInit = null;
let circleMembersInit = null;

userLocal ? (userInit = userLocal) : (userInit = null);
circleLocal ? (circleInit = circleLocal) : (circleInit = null);
sec_delLocal ? (sec_delInit = sec_delLocal) : (sec_delInit = null);

circleMembersLocal ? (circleMembersInit = circleMembersLocal) : (circleMembersInit = null);

const initialState = {
  user: userInit,
  circle: circleInit,
  sec_del: sec_delInit,
  circleMembers: circleMembersInit,
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
      localStorage.removeItem("AuthUser");
      localStorage.removeItem("circle");
      localStorage.removeItem("sec_del");
      localStorage.removeItem("circleMembers");
    },
    circle: (state, action) => {
      state.circle = action.payload;
      toLocalStorage("circle", state.circle);
    },
    sec_del: (state, action) => {
      state.sec_del = action.payload;
      toLocalStorage("sec_del", state.sec_del);
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
export const { authenticate, logout, circle, sec_del, addCirclemMembers, desolveCircle } =
  UserSlice.actions;
export default UserSlice.reducer;
