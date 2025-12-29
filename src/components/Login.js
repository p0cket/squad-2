import React, { useState } from "react";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doCreateUserWithEmailAndPassword,
  doSignOut,
} from "../firebase/auth";
import { useAuth } from "../contexts/authContext";
import {
  Button,
  Modal,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import FireInput from "../firebase/FireInput";
import Chat from "../firebase/Chat";
import ChatWithFriend from "../firebase/ChatWithFriend";

const modalClasses = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white shadow-2xl p-8 rounded-lg outline-none";

function LoginForm({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithEmailAndPassword(email, password);
        onClose();
      } catch (err) {
        setError("Failed to log in");
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithGoogle();
        onClose();
      } catch (err) {
        setError("Failed to log in with Google");
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-normal mb-4">
        Login
      </h2>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isSigningIn}
        className="mt-4"
        sx={{ mt: 2 }} 
      >
        {isSigningIn ? <CircularProgress size={24} /> : "Login"}
      </Button>
      <Button
        onClick={handleGoogleSignIn}
        fullWidth
        variant="contained"
        color="error"
        className="mt-4"
        sx={{ mt: 2 }}
        disabled={isSigningIn}
      >
        {isSigningIn ? <CircularProgress size={24} /> : "Sign in with Google"}
      </Button>
    </form>
  );
}

function SignUpForm({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (!isSigningUp) {
      setIsSigningUp(true);
      try {
        await doCreateUserWithEmailAndPassword(email, password);
        onClose();
      } catch (err) {
        setError("Failed to sign up");
      } finally {
        setIsSigningUp(false);
      }
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <h2 className="text-2xl font-normal mb-4">
        Sign Up
      </h2>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="success"
        disabled={isSigningUp}
        className="mt-4"
        sx={{ mt: 2 }}
      >
        {isSigningUp ? <CircularProgress size={24} /> : "Sign Up"}
      </Button>
    </form>
  );
}

function Login() {
  const { userLoggedIn, currentUser } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  return (
    <>
      {userLoggedIn ? (
        <div className="text-center">
          <Button
            onClick={() => doSignOut()}
            variant="contained"
            color="error"
            size="small"
            className="min-w-0 px-2 py-1"
            sx={{ minWidth: "auto", padding: "4px 8px" }}
          >
            Hi{" "}
            {currentUser.displayName
              ? currentUser.displayName
              : currentUser.email}
            ! LogOut?
          </Button>
          {/* <FireInput /> */}
          {/* <Chat /> */}
          {/* Uncomment when working on ChatWithFriend Firebase nonsense */}
          {/* <ChatWithFriend /> */}
        </div>
      ) : (
        <>
          <Button
            onClick={() => setIsLoginModalOpen(true)}
            variant="contained"
            color="primary"
            size="small"
            className="mb-4 min-w-0 px-2 py-1"
            sx={{ mb: 2, minWidth: "auto", padding: "4px 8px" }}
          >
            Login
          </Button>
          <Button
            onClick={() => setIsSignUpModalOpen(true)}
            variant="contained"
            color="success"
            size="small"
            className="min-w-0 px-2 py-1"
            sx={{ minWidth: "auto", padding: "4px 8px" }}
          >
            Sign Up
          </Button>
        </>
      )}

      {/* Login Modal */}
      <Modal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        aria-labelledby="login-modal-title"
      >
        <div className={modalClasses}>
          <LoginForm onClose={() => setIsLoginModalOpen(false)} />
        </div>
      </Modal>

      {/* Sign Up Modal */}
      <Modal
        open={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        aria-labelledby="signup-modal-title"
      >
        <div className={modalClasses}>
          <SignUpForm onClose={() => setIsSignUpModalOpen(false)} />
        </div>
      </Modal>
    </>
  );
}

export default Login;
