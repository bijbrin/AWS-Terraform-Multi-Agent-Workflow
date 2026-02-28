'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowStore } from '@/store/workflow-store';
import { 
  Cloud, 
  Key, 
  Lock, 
  Globe,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  FileCode
} from 'lucide-react';

interface AWSCredentialsProps {
  onCredentialsChange?: (creds: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    sessionToken?: string;
  }) => void;
}

export function AWSCredentials({ onCredentialsChange }: AWSCredentialsProps) {
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [region, setRegion] = useState('ap-southeast-2');
  const [showSecret, setShowSecret] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const REGIONS = [
    { value: 'ap-southeast-2', label: 'Sydney (ap-southeast-2)' },
    { value: 'us-east-1', label: 'N. Virginia (us-east-1)' },
    { value: 'us-west-2', label: 'Oregon (us-west-2)' },
    { value: 'eu-west-1', label: 'Ireland (eu-west-1)' },
    { value: 'ap-northeast-1', label: 'Tokyo (ap-northeast-1)' },
    { value: 'eu-central-1', label: 'Frankfurt (eu-central-1)' },
  ];

  const validateCredentials = (keyId: string, secret: string) => {
    // Basic validation: AWS access keys are 20 chars, secrets are 40 chars
    const isKeyIdValid = keyId.length >= 16 && keyId.startsWith('AKIA');
    const isSecretValid = secret.length >= 30;
    return isKeyIdValid && isSecretValid;
  };

  const handleChange = (field: string, value: string) => {
    let newAccessKeyId = accessKeyId;
    let newSecretAccessKey = secretAccessKey;
    let newSessionToken = sessionToken;
    let newRegion = region;

    switch (field) {
      case 'accessKeyId':
        newAccessKeyId = value;
        setAccessKeyId(value);
        break;
      case 'secretAccessKey':
        newSecretAccessKey = value;
        setSecretAccessKey(value);
        break;
      case 'sessionToken':
        newSessionToken = value;
        setSessionToken(value);
        break;
      case 'region':
        newRegion = value;
        setRegion(value);
        break;
    }

    const valid = validateCredentials(newAccessKeyId, newSecretAccessKey);
    setIsValid(valid);

    if (onCredentialsChange) {
      onCredentialsChange({
        accessKeyId: newAccessKeyId,
        secretAccessKey: newSecretAccessKey,
        region: newRegion,
        sessionToken: newSessionToken || undefined,
      });
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + '****' + key.slice(-4);
  };

  return (
    <Card className="border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          AWS Target Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Info Banner */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <Globe className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Deployment Target</p>
              <p className="text-muted-foreground">
                Infrastructure will be deployed to: <strong>{region}</strong>
              </p>
              {accessKeyId && (
                <p className="text-muted-foreground mt-1">
                  Account: <code className="bg-muted px-1 rounded">{maskKey(accessKeyId)}</code>
                </p>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="credentials" className="space-y-4 mt-4">
            {/* Access Key ID */}
            <div className="space-y-2">
              <Label htmlFor="access-key" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                AWS Access Key ID
              </Label>
              <Input
                id="access-key"
                placeholder="AKIA..."
                value={accessKeyId}
                onChange={(e) => handleChange('accessKeyId', e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Must start with AKIA (20 characters)
              </p>
            </div>

            {/* Secret Access Key */}
            <div className="space-y-2">
              <Label htmlFor="secret-key" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                AWS Secret Access Key
              </Label>
              <div className="relative">
                <Input
                  id="secret-key"
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter your secret access key"
                  value={secretAccessKey}
                  onChange={(e) => handleChange('secretAccessKey', e.target.value)}
                  className="font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your secret key is never stored, only used for this deployment
              </p>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <Label htmlFor="region" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                AWS Region
              </Label>
              <select
                id="region"
                value={region}
                onChange={(e) => handleChange('region', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            {/* Session Token (for temporary credentials) */}
            <div className="space-y-2">
              <Label htmlFor="session-token" className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Session Token (Optional)
              </Label>
              <Input
                id="session-token"
                placeholder="For temporary credentials from STS"
                value={sessionToken}
                onChange={(e) => handleChange('sessionToken', e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Required when using temporary credentials from AWS STS
              </p>
            </div>

            {/* IAM Role Info */}
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium">Alternative: IAM Role</p>
              <p className="text-xs text-muted-foreground mt-1">
                For production, consider using IAM roles instead of access keys.
                Set up an OIDC provider with your CI/CD pipeline.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Validation Status */}
        <div className="flex items-center gap-2 pt-2">
          {isValid ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">Credentials valid</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                Enter valid AWS credentials to proceed
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
