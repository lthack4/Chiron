import React, { useState } from "react";
import {
  User,
  Lock,
  Shield,
  HelpCircle,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

type SettingsSection = "user" | "password" | "mfa" | "support";

export default function Settings(){

  const [activeSection, setActiveSection] = useState<SettingsSection>('User');
  const [showCurrentPassword, setshowCurrentPassword] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const navigationItems = [
    { id: 'user', label: 'Account', icon: User },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'mfa', label: 'Multi-Factor Authentication', icon: Shield },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const renderUserSettings = () => (
     <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
      <div className="bg-neutral-800 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue=""
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              defaultValue=""
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderPasswordSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
      <div className="bg-neutral-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              className="w-full px-3 py-2 pr-10 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full px-3 py-2 pr-10 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
          <Lock className="w-4 h-4" />
          Update Password
        </button>
      </div>
    </div>
  );

const renderMfaSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Multi-Factor Authentication</h3>
      <div className="bg-neutral-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Enable MFA</p>
            <p className="text-sm text-neutral-400">Add an extra layer of security to your account</p>
          </div>
          <button
            onClick={() => setMfaEnabled(!mfaEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              mfaEnabled ? 'bg-green-600' : 'bg-neutral-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                mfaEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {mfaEnabled && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm">
              MFA is enabled. Use your authenticator app to generate codes when logging in.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSupportSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Support</h3>
      <div className="bg-neutral-800 rounded-lg p-6 space-y-4">
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors">
            <span className="text-white">Contact Support</span>
            <span className="text-neutral-400">→</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'user':
        return renderUserSettings();
      case 'password':
        return renderPasswordSettings();
      case 'mfa':
        return renderMfaSettings();
      case 'support':
        return renderSupportSettings();
      default:
        return renderUserSettings();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex">
      <aside className="w-64 bg-neutral-800 border-r border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as SettingsSection)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  )
}


  


  
    //<div style={{ display: "grid", gap: 12, padding: 20 }}>
      //<aside className="w-64 bg-neutral-900 p-4">
        //<h2 className="text-lg font-semibold mb-6">Settings</h2>
        //<ul className="space-y-2">
          //<li>
            //<button className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-800">
              //Account
            //</button>
          //</li>
          //<li>
            //<button className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-800">
              //Change Password
            //</button>
          //</li>
          //<li>
            //<button className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-800">
              //Multi-Factor Authentication
            //</button>
          //</li>
          //<li>
            //<button className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-800">
              //Support
            //</button>
          //</li>
        //</ul>
      //</aside>
    //</div>
};

