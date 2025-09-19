export default function Settings() {
  return (
    <div style={{ display: "grid", gap: 12, padding: 20 }}>
      <h2>Settings</h2>
      <p>Manage your account settings below:</p>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        <li>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-800">
            Change Password
          </button>
        </li>
        <li>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-800">
            Enable MFA
          </button>
        </li>
        <li>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-800">
            Basic Account Info
          </button>
        </li>
      </ul>
    </div>
  );
}

