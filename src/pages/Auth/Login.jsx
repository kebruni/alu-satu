
import styles from "./Auth.module.css";

const Login = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Login</h1>
    <p className={styles.subtitle}>Sign in to your account.</p>
    <input className={styles.field} type="email" placeholder="Email" />
    <input className={styles.field} type="password" placeholder="Password" />
    <button className={styles.submitBtn} type="button">Login</button>
  </div>
);

export default Login;
