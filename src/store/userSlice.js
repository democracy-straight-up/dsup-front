import { createSlice } from '@reduxjs/toolkit'

// init the initial State to local and check if the user already added to cart
const userLocal = JSON.parse(localStorage.getItem('AuthUser'))
const circleLocal = JSON.parse(localStorage.getItem('circle'))
const circleMembersLocal = JSON.parse(localStorage.getItem('circleMembers'))

let userInit = null;
let circleInit = null;
let circleMembersInit = null

userLocal ? userInit = userLocal : userInit = null;
circleLocal ? circleInit = circleLocal : circleInit = null;
circleMembersLocal ? circleMembersInit = circleMembersLocal : circleMembersInit = null;

const initialState = {
  user: userInit,
  circle: circleInit,
  circleMembers: circleMembersInit,
}

export const UserSlice = createSlice({
  name: 'authUser',
  initialState,
  reducers: {
    authenticate: (state, action) => {
      state.user = action.payload
      // add cart to localstorage
      toLocalStorage('AuthUser', state.user)
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('AuthUser');
      localStorage.removeItem('circle');
      localStorage.removeItem('circleMembers');
    },
    circle: (state, action) => {
      state.circle = action.payload
      toLocalStorage('circle', state.circle);
    },
    addCirclemMembers: (state, action) => {
      state.circleMembers = action.payload;
      toLocalStorage('circleMembers', state.circleMembers)
    },
    desolveCircle: (state, action) => {
      state.circle = null
      state.circleMembers = null
      localStorage.removeItem('circle');
      localStorage.removeItem('circleMembers');
    }

  },
})

function toLocalStorage(store, user) {
  localStorage.setItem(store, JSON.stringify(user));
}

// Action creators are generated for each case reducer function
export const { authenticate, logout, circle, addCirclemMembers, desolveCircle } = UserSlice.actions
export default UserSlice.reducer
