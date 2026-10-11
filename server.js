const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database State (Persisted locally via JSON for zero-configuration startup)
const DB_FILE = path.join(__dirname, 'db.json');

let db = {
  users: [
      { id: 1, phone: '0795140634', pass: 'admin123', inviteCode: 'WATTENADMIN', isAdmin: true, currentLevel: 'T12', mainWallet: 1000000, earnWallet: 5000000, r1Count: 0, r2Count: 0, r3Count: 0 }
        ],
          settings: {
              minDeposit: 5000, maxDeposit: 10000000, minWithdraw: 10000, maxWithdraw: 5000000,
                  withdrawFee: 2, whatsappSupport: '256795140634', telegramSupport: '@watten_support',
                      obpay: { key1: 'ob_live_xxx', key2: 'ob_sec_xxx', key3: 'ob_token_xxx', name: 'kaiwa Julius', phone: '0795140634' },
                          marz: { key1: 'marz_live_xxx', key2: 'marz_sec_xxx', key3: 'marz_token_xxx', name: 'kaiwa Julius', phone: '0795140634' }
                            },
                              taskConfigs: {
                                  T1: { cost: 65000, pay: 330, tasks: 7 },
                                      T2: { cost: 150000, pay: 950, tasks: 7 },
                                          T3: { cost: 280000, pay: 1600, tasks: 7 },
                                              T4: { cost: 570000, pay: 3200, tasks: 7 },
                                                  T5: { cost: 980000, pay: 5600, tasks: 7 },
                                                      T6: { cost: 1750000, pay: 9500, tasks: 7 },
                                                          T7: { cost: 2500000, pay: 13500, tasks: 7 },
                                                              T8: { cost: 5000000, pay: 31000, tasks: 7 },
                                                                  T9: { cost: 8000000, pay: 48000, tasks: 7 },
                                                                      T10: { cost: 16000000, pay: 80000, tasks: 7 },
                                                                          T11: { cost: 35000000, pay: 220000, tasks: 7 },
                                                                              T12: { cost: 50000000, pay: 290000, tasks: 7 }
                                                                                },
                                                                                  transactions: [],
                                                                                    marketAds: [],
                                                                                      announcements: []
                                                                                      };

                                                                                      function saveDB() {
                                                                                        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
                                                                                        }

                                                                                        if (fs.existsSync(DB_FILE)) {
                                                                                          try { db = JSON.parse(fs.readFileSync(DB_FILE)); } catch (e) {}
                                                                                          }

                                                                                          // WhatsApp OTP Mock Route
                                                                                          app.post('/api/auth/otp', (req, res) => {
                                                                                            const { phone } = req.body;
                                                                                              const otp = Math.floor(100000 + Math.random() * 900000);
                                                                                                console.log(`[WHATSAPP API MOCK] Sent OTP ${otp} to phone ${phone}`);
                                                                                                  res.json({ success: true, otp });
                                                                                                  });

                                                                                                  // Register Route
                                                                                                  app.post('/api/auth/register', (req, res) => {
                                                                                                    const { phone, pass, inviteCode } = req.body;
                                                                                                      if (!inviteCode) return res.status(400).json({ error: 'Invitation code is mandatory!' });
                                                                                                        
                                                                                                          const upline = db.users.find(u => u.inviteCode === inviteCode);
                                                                                                            if (!upline && inviteCode !== 'WATTENADMIN') return res.status(400).json({ error: 'Invalid invitation code.' });

                                                                                                              if (db.users.find(u => u.phone === phone)) return res.status(400).json({ error: 'Phone number already registered.' });

                                                                                                                const newInvite = 'WATTEN' + Math.random().toString(36).substring(2, 7).toUpperCase();
                                                                                                                  const newUser = {
                                                                                                                      id: db.users.length + 1,
                                                                                                                          phone, pass, inviteCode: newInvite,
                                                                                                                              uplineId: upline ? upline.id : null,
                                                                                                                                  currentLevel: 'T0',
                                                                                                                                      mainWallet: 0,
                                                                                                                                          earnWallet: 0,
                                                                                                                                              isAdmin: phone === '0795140634',
                                                                                                                                                  isSuspended: false,
                                                                                                                                                      tasksToday: 0
                                                                                                                                                        };

                                                                                                                                                          db.users.push(newUser);
                                                                                                                                                            saveDB();
                                                                                                                                                              res.json({ success: true, user: newUser });
                                                                                                                                                              });

                                                                                                                                                              // Login Route
                                                                                                                                                              app.post('/api/auth/login', (req, res) => {
                                                                                                                                                                const { phone, pass } = req.body;
                                                                                                                                                                  const user = db.users.find(u => u.phone === phone && u.pass === pass);
                                                                                                                                                                    if (!user) return res.status(401).json({ error: 'Invalid credentials or phone number.' });
                                                                                                                                                                      if (user.isSuspended) return res.status(403).json({ error: 'Your account has been suspended by admin.' });
                                                                                                                                                                        res.json({ success: true, user });
                                                                                                                                                                        });

                                                                                                                                                                        // Complete Task Route (Instant Credit + Team Commission)
                                                                                                                                                                        app.post('/api/task/complete', (req, res) => {
                                                                                                                                                                          const { userId, level } = req.body;
                                                                                                                                                                            const user = db.users.find(u => u.id === userId);
                                                                                                                                                                              if (!user) return res.status(404).json({ error: 'User not found' });

                                                                                                                                                                                const config = db.taskConfigs[level] || { pay: 330 };
                                                                                                                                                                                  const pay = config.pay;

                                                                                                                                                                                    if (user.currentLevel === 'T0') {
                                                                                                                                                                                        user.earnWallet += pay; // Locked until upgrade
                                                                                                                                                                                          } else {
                                                                                                                                                                                              user.earnWallet += pay;
                                                                                                                                                                                                }
                                                                                                                                                                                                  user.tasksToday = (user.tasksToday || 0) + 1;

                                                                                                                                                                                                    // 3-Step Team Commission on daily task earnings (T1: 5%, T2: 3%, T3: 1%)
                                                                                                                                                                                                      if (user.uplineId) {
                                                                                                                                                                                                          let r1 = db.users.find(u => u.id === user.uplineId);
                                                                                                                                                                                                              if (r1) {
                                                                                                                                                                                                                    r1.earnWallet += pay * 0.05;
                                                                                                                                                                                                                          if (r1.uplineId) {
                                                                                                                                                                                                                                  let r2 = db.users.find(u => u.id === r1.uplineId);
                                                                                                                                                                                                                                          if (r2) {
                                                                                                                                                                                                                                                    r2.earnWallet += pay * 0.03;
                                                                                                                                                                                                                                                              if (r2.uplineId) {
                                                                                                                                                                                                                                                                          let r3 = db.users.find(u => u.id === r2.uplineId);
                                                                                                                                                                                                                                                                                      if (r3) r3.earnWallet += pay * 0.01;
                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                                      saveDB();
                                                                                                                                                                                                                                                                                                                        res.json({ success: true, earned: pay, earnWallet: user.earnWallet });
                                                                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                                                                        server.listen(3000, () => console.log('WATTEN Server running seamlessly on port 3000'));

                                                                                                                                                                                                                                                                                                                        