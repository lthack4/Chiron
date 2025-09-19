export default function Settings() {
  return (
    <div style={{ display: "grid", gap: 12, padding: 20 }}>
      <h2>Settings</h2>
      <p>Manage your account settings below:</p>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        <li>
          <button onClick={() => alert("Change password clicked")}>
            Change Password
          </button>
        </li>
        <li>
          <button onClick={() => alert("Enable MFA clicked")}>
            Enable MFA
          </button>
        </li>
        <li>
          <button onClick={() => alert("Basic account info clicked")}>
            Basic Account Info
          </button>
        </li>
      </ul>
    </div>
  );
}

