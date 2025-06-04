import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  QrCode, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  Copy,
  Download,
  Eye,
  EyeOff,
  Smartphone,
  Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onCancel }) => {
  const { enableTwoFactor, verifyTwoFactor, userProfile } = useAuth();
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [secret, setSecret] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [showBackupCodes, setShowBackupCodes] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (step === 'setup') {
      handleSetup();
    }
  }, [step]);

  const handleSetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await enableTwoFactor();
      setSecret(result.secret);
      setQrCodeUrl(result.qrCodeUrl);
      setBackupCodes(result.backupCodes);
    } catch (error) {
      setError('Failed to set up two-factor authentication');
      console.error('2FA setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await verifyTwoFactor(verificationCode, secret);
      
      if (isValid) {
        setStep('complete');
        toast.success('Two-factor authentication enabled successfully!');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      console.error('2FA verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${description} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadBackupCodes = () => {
    const codesText = `TrainStation Dashboard - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\nUser: ${userProfile?.email}\n\nBackup Codes (use each code only once):\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nKeep these codes safe and secure. They can be used to access your account if you lose your authenticator device.`;
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trainstation-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Backup codes downloaded');
  };

  if (step === 'setup') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Set Up Two-Factor Authentication</h2>
                <p className="text-gray-400">Add an extra layer of security to your account</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Setting up two-factor authentication...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-blue-400" />
                    Step 1: Install an Authenticator App
                  </h3>
                  <p className="text-gray-300 mb-3">
                    Download and install an authenticator app on your phone:
                  </p>
                  <ul className="text-gray-400 space-y-1 text-sm">
                    <li>• Google Authenticator</li>
                    <li>• Microsoft Authenticator</li>
                    <li>• Authy</li>
                    <li>• 1Password</li>
                  </ul>
                </div>

                {/* QR Code */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-400" />
                    Step 2: Scan QR Code
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      {/* QR Code would go here - for demo, showing placeholder */}
                      <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded">
                        <QrCode className="h-12 w-12 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 mb-3">
                        Scan this QR code with your authenticator app, or enter the secret key manually:
                      </p>
                      <div className="bg-gray-700 rounded p-3 font-mono text-sm break-all">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">{secret}</span>
                          <button
                            onClick={() => copyToClipboard(secret, 'Secret key')}
                            className="ml-2 p-1 hover:bg-gray-600 rounded"
                            title="Copy secret key"
                          >
                            <Copy className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Step */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Key className="h-5 w-5 text-blue-400" />
                    Step 3: Verify Setup
                  </h3>
                  <p className="text-gray-300 mb-4">
                    After scanning the QR code, your authenticator app will generate a 6-digit code. Enter it below to verify the setup:
                  </p>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={6}
                    />
                    <button
                      onClick={handleVerification}
                      disabled={verificationCode.length !== 6 || isLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full">
          <div className="p-6">
            {/* Success Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Two-Factor Authentication Enabled!</h2>
              <p className="text-gray-400">Your account is now more secure</p>
            </div>

            {/* Backup Codes */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="font-semibold text-amber-400">Important: Save Your Backup Codes</h3>
              </div>
              <p className="text-amber-300 text-sm mb-4">
                These backup codes can be used to access your account if you lose your authenticator device. 
                Each code can only be used once.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300"
                  >
                    {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showBackupCodes ? 'Hide' : 'Show'} backup codes
                  </button>
                </div>

                {showBackupCodes && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="font-mono text-sm text-gray-300 bg-gray-700 p-2 rounded">
                          {index + 1}. {code}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(backupCodes.join('\n'), 'Backup codes')}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Codes
                      </button>
                      <button
                        onClick={downloadBackupCodes}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Download className="h-4 w-4" />
                        Download Codes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-400" />
                Security Tips
              </h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Keep your authenticator device secure and backed up</li>
                <li>• Store backup codes in a safe place (not on the same device)</li>
                <li>• Don't share your backup codes with anyone</li>
                <li>• Use a unique, strong password for your account</li>
              </ul>
            </div>

            {/* Complete Button */}
            <button
              onClick={onComplete}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}; 