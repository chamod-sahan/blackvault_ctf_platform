import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ctf.platform' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@ctf.platform',
      passwordHash: adminPassword,
      role: 'ADMIN',
      points: 0,
    },
  });
  console.log('Created admin user:', admin.username);

  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@ctf.platform' },
    update: {},
    create: {
      username: 'player1',
      email: 'user@ctf.platform',
      passwordHash: userPassword,
      role: 'USER',
      points: 0,
    },
  });
  console.log('Created demo user:', user.username);

  const challenges = [
    {
      title: 'Hello World',
      description: 'Welcome to the CTF platform! Your first challenge is to find the flag. The flag format is CTF{...}',
      category: 'Warmup',
      difficulty: 'EASY',
      points: 10,
      flag: 'CTF{hello_world}',
      flagHash: await bcrypt.hash('CTF{hello_world}', 12),
    },
    {
      title: 'Basic SQL Injection',
      description: 'Can you exploit this vulnerable login form?\n\n```sql\nSELECT * FROM users WHERE username = ? AND password = ?\n```\n\nHint: Think about what happens when you bypass the password check.',
      category: 'Web',
      difficulty: 'EASY',
      points: 50,
      flag: 'CTF{sql_injection_master}',
      flagHash: await bcrypt.hash('CTF{sql_injection_master}', 12),
    },
    {
      title: 'Buffer Overflow 101',
      description: 'This simple program has a vulnerability. Can you overflow the buffer and execute the win function?\n\nDownload the binary and analyze it with your favorite tools.\n\n`nc challenge.ctf 1234`',
      category: 'Pwn',
      difficulty: 'MEDIUM',
      points: 100,
      flag: 'CTF{buffer_overflow_exploited}',
      flagHash: await bcrypt.hash('CTF{buffer_overflow_exploited}', 12),
    },
    {
      title: 'RSA Basics',
      description: 'Given the following RSA parameters:\n\n- n = 323\n- e = 5\n- ciphertext = 243\n\nFind the plaintext m.',
      category: 'Crypto',
      difficulty: 'EASY',
      points: 75,
      flag: 'CTF{rsa_easy_math}',
      flagHash: await bcrypt.hash('CTF{rsa_easy_math}', 12),
    },
    {
      title: 'Hidden in Plain Sight',
      description: 'The flag is hidden in this image. Use your forensic skills to find it.\n\nDownload the image and analyze it carefully.',
      category: 'Forensics',
      difficulty: 'EASY',
      points: 50,
      flag: 'CTF{st3g0_king}',
      flagHash: await bcrypt.hash('CTF{st3g0_king}', 12),
    },
    {
      title: 'XSS Playground',
      description: 'This comment section is vulnerable to XSS. Can you steal the admin\'s cookie?\n\nURL: http://web.challenge.ctf/comment\n\nHint: The admin visits all comments every minute.',
      category: 'Web',
      difficulty: 'MEDIUM',
      points: 150,
      flag: 'CTF{xss_cookie_theft}',
      flagHash: await bcrypt.hash('CTF{xss_cookie_theft}', 12),
    },
    {
      title: 'Advanced Reverse Engineering',
      description: 'This obfuscated binary is protected with multiple layers of encryption. Reverse engineer it to find the flag.\n\nUse IDA Pro, Ghidra, or your favorite disassembler.',
      category: 'Reverse',
      difficulty: 'HARD',
      points: 300,
      flag: 'CTF{re_master_2024}',
      flagHash: await bcrypt.hash('CTF{re_master_2024}', 12),
    },
    {
      title: 'JWT Vulnerabilities',
      description: 'This application uses JWT for authentication. Can you forge a token to become admin?\n\nThe secret key might be weak...',
      category: 'Web',
      difficulty: 'MEDIUM',
      points: 125,
      flag: 'CTF{jwt_hs256_hack}',
      flagHash: await bcrypt.hash('CTF{jwt_hs256_hack}', 12),
    },
    {
      title: 'Network Traffic Analysis',
      description: 'A suspicious network capture file is provided. Analyze the pcap and find the hidden communication.\n\nWhat data was exfiltrated?',
      category: 'Forensics',
      difficulty: 'MEDIUM',
      points: 100,
      flag: 'CTF{pcap_analyzer_pro}',
      flagHash: await bcrypt.hash('CTF{pcap_analyzer_pro}', 12),
    },
    {
      title: 'Heap Exploitation',
      description: 'This binary has a heap-based vulnerability. Can you achieve code execution?\n\nFormat: nc pwn.challenge.ctf 9999',
      category: 'Pwn',
      difficulty: 'EXPERT',
      points: 500,
      flag: 'CTF{heap_exploit_god}',
      flagHash: await bcrypt.hash('CTF{heap_exploit_god}', 12),
    },
    {
      title: 'Active Directory 101',
      description: 'Compromise this Windows domain controller. Find the GPP password and escalate to Domain Admin.',
      category: 'Windows',
      type: 'MACHINE',
      os: 'WINDOWS',
      difficulty: 'HARD',
      points: 250,
      flag: 'HTB{win_ad_pwned}',
      flagHash: await bcrypt.hash('HTB{win_ad_pwned}', 12),
    },
    {
      title: 'Legacy Linux',
      description: 'This old CentOS server is running a vulnerable version of Apache. Get a shell and find the root flag.',
      category: 'Linux',
      type: 'MACHINE',
      os: 'LINUX',
      difficulty: 'MEDIUM',
      points: 150,
      flag: 'HTB{linux_root_access}',
      flagHash: await bcrypt.hash('HTB{linux_root_access}', 12),
    },
  ];

  for (const challenge of challenges) {
    await prisma.challenge.upsert({
      where: { title: challenge.title },
      update: challenge,
      create: challenge,
    });
    console.log('Created challenge/machine:', challenge.title);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
