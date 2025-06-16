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
    console.log('Script başladı...');
    
    // MongoDB'ye bağlan
    await mongoose.connect('mongodb://localhost:27017/quizaki');
    console.log('MongoDB\'ye bağlandı');

    // Mevcut admin kullanıcısını kontrol et
    const existingAdmin = await User.findOne({ email: 'asil@nevo.com' });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut:', existingAdmin.email);
      
      // Şifreyi güncelle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('asil123', salt);
      
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.emailVerified = true;
      await existingAdmin.save();
      
      console.log('Admin kullanıcısı güncellendi');
    } else {
      // Yeni admin kullanıcısı oluştur
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('asil123', salt);
      
      const adminUser = new User({
        name: 'Asil Nevo',
        email: 'asil@nevo.com',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
        age: '25-34',
        gender: 'Erkek',
        selectedAvatar: 'avatar1.png'
      });
      
      await adminUser.save();
      console.log('Admin kullanıcısı oluşturuldu:', adminUser.email);
    }

    // Tüm kullanıcıları listele
    const users = await User.find({}, 'name email role emailVerified');
    console.log('\nMevcut kullanıcılar:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Verified: ${user.emailVerified}`);
    });

    mongoose.connection.close();
    console.log('\nİşlem tamamlandı');
    
  } catch (error) {
    console.error('Hata:', error);
    mongoose.connection.close();
  }
};

createAdminUser(); 