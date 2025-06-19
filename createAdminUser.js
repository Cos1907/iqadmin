const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema - Backend'deki User modelini burada tanımlıyoruz
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user',
  },
  age: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    enum: ['Erkek', 'Kadın', 'Diğer', ''],
    default: '',
  },
  selectedAvatar: {
    type: String,
    default: 'avatar1.png',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationExpires: {
    type: Date,
  },
  purchasedTests: [
    {
      testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
      purchasedAt: { type: Date, default: Date.now },
    },
  ],
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Result' }],
  certificates: [
    {
      testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
      certificateLink: String,
    },
  ],
  subscriptions: [
    {
      subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PricePackage' },
      startDate: Date,
      endDate: Date,
      status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

const createAdminUser = async () => {
  try {
    console.log('Admin kullanıcı oluşturma scripti başladı...');
    
    // MongoDB'ye bağlan
    await mongoose.connect('mongodb://localhost:27017/quizaki');
    console.log('MongoDB\'ye bağlandı');

    // Admin bilgileri (güvenlik için konsola yazdırılmaz)
    const adminEmail = 'info@iqtestim.com';
    const adminPassword = '!sdP5g35s!b';
    const adminName = 'IQTESTIM Admin';

    // Mevcut admin kullanıcısını kontrol et
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut, güncelleniyor...');
      
      // Şifreyi güncelle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.emailVerified = true;
      existingAdmin.name = adminName;
      await existingAdmin.save();
      
      console.log('Admin kullanıcısı başarıyla güncellendi');
    } else {
      // Yeni admin kullanıcısı oluştur
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const adminUser = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
        age: '25-34',
        gender: 'Erkek',
        selectedAvatar: 'avatar1.png'
      });
      
      await adminUser.save();
      console.log('Admin kullanıcısı başarıyla oluşturuldu');
    }

    // Sadece admin kullanıcılarını listele (güvenlik için şifre gösterilmez)
    const adminUsers = await User.find({ role: 'admin' }, 'name email role emailVerified');
    console.log('\nAdmin kullanıcıları:');
    adminUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Verified: ${user.emailVerified}`);
    });

    console.log('\nGiriş bilgileri:');
    console.log(`E-posta: ${adminEmail}`);
    console.log('Şifre: [Güvenlik nedeniyle gösterilmiyor]');

    mongoose.connection.close();
    console.log('\nİşlem başarıyla tamamlandı');
    
  } catch (error) {
    console.error('Hata oluştu:', error.message);
    mongoose.connection.close();
  }
};

createAdminUser(); 