
import styles from "./Auth.module.css";

const Register = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Register</h1>
    <p className={styles.subtitle}>Create your account to continue.</p>
    <input className={styles.field} type="text" placeholder="Name" />
    <input className={styles.field} type="email" placeholder="Email" />
    <input className={styles.field} type="password" placeholder="Password" />
    <button className={styles.submitBtn} type="button">Register</button>
  </div>
);

export default Register;
