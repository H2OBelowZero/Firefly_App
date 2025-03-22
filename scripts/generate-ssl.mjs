import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import selfsigned from 'selfsigned';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create .cert directory if it doesn't exist
const certDir = path.join(path.dirname(__dirname), '.cert');

function generateCertificate() {
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'US' },
    { name: 'stateOrProvinceName', value: 'State' },
    { name: 'localityName', value: 'City' },
    { name: 'organizationName', value: 'Development' },
    { name: 'organizationalUnitName', value: 'Development' }
  ];

  const pems = selfsigned.generate(attrs, {
    algorithm: 'sha256',
    days: 365,
    keySize: 2048,
    extensions: [
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 2, // DNS
            value: 'localhost'
          },
          {
            type: 2,
            value: '*.localhost'
          },
          {
            type: 7, // IP
            ip: '127.0.0.1'
          }
        ]
      }
    ]
  });

  return {
    privateKey: pems.private,
    certificate: pems.cert
  };
}

try {
  // Create directory
  await fs.mkdir(certDir, { recursive: true });

  console.log('Generating SSL certificates...');

  const { privateKey, certificate } = generateCertificate();

  // Write files
  await fs.writeFile(path.join(certDir, 'key.pem'), privateKey);
  await fs.writeFile(path.join(certDir, 'cert.pem'), certificate);

  console.log('SSL certificates generated successfully!');
  console.log('Location: .cert/');
  console.log('Files created:');
  console.log('  - key.pem (private key)');
  console.log('  - cert.pem (certificate)');
} catch (error) {
  console.error('Error generating SSL certificates:', error.message);
  process.exit(1);
} 