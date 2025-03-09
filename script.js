import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA-qRTFlszcMafJv1eesYg-PUxsxYoo28U",
    authDomain: "misha-and-anna-48e4c.firebaseapp.com",
    databaseURL: "https://misha-and-anna-48e4c-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "misha-and-anna-48e4c",
    storageBucket: "misha-and-anna-48e4c.firebasestorage.app",
    messagingSenderId: "822036073579",
    appId: "1:822036073579:web:cd59fd4f5362b5f0bb752e",
    measurementId: "G-XR86X6PXMX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const courseSchedule = {
    'Курс английского': ['Понедельник, 16:00', 'Среда, 16:00', 'Пятница, 10:00'],
    'Курс русского': ['Понедельник, 17:00', 'Среда, 17:00', 'Пятница, 11:00'],
    'Курс математики': ['Понедельник, 18:00', 'Среда, 18:00', 'Пятница, 17:00']
};

const telegramToken = '8052501239:AAGFdenBK73gNDaogdoPdcclkdHSTnNBEyI';
const teacherChatId = '1042168412';
const teacherEmail = "languageweblab@gmail.com";

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.querySelector('.loading-screen')?.style.opacity = '0';
        setTimeout(() => document.querySelector('.loading-screen')?.remove(), 800);
    }, 2000);

    const cursor = document.querySelector('.cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 600);
    });

    document.querySelectorAll('button, a, .course-card').forEach(item => {
        item.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        item.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    const particlesContainer = document.querySelector('.particles-container');
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 5 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        particlesContainer.appendChild(particle);
        particle.animate([
            { transform: 'translate(0, 0)', opacity: 0 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`, opacity: 0.8 },
            { transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`, opacity: 0 }
        ], {
            duration: (Math.random() * 10 + 5) * 1000,
            easing: 'ease-in-out'
        }).onfinish = () => particle.remove();
    }
    setInterval(createParticle, 300);

    let currentUser = null;
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (window.location.pathname.includes('main.html')) {
            if (!user) {
                window.location.href = 'index.html';
            } else {
                document.getElementById('main-content').classList.add('active');
                document.getElementById('profile-btn').style.display = 'inline-block';
                document.getElementById('profile-btn').textContent = user.email === teacherEmail ? 'Учительский кабинет' : 'Личный кабинет';
            }
        } else if (window.location.pathname.includes('index.html') && user) {
            window.location.href = 'main.html';
        }
    });

    if (window.location.pathname.includes('index.html')) {
        document.getElementById('explore-btn')?.addEventListener('click', () => {
            document.querySelector('header').style.opacity = '0';
            setTimeout(() => {
                document.querySelector('header').style.display = 'none';
                document.getElementById('auth-modal').classList.add('active');
            }, 800);
        });

        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.getAttribute('data-tab') + '-content').classList.add('active');
            });
        });

        document.getElementById('register-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                await addDoc(collection(db, "users"), { uid: userCredential.user.uid, name, email, role: "student", createdAt: new Date().toISOString() });
                document.getElementById('success-title').textContent = 'Регистрация успешна!';
                document.getElementById('success-message').textContent = 'Добро пожаловать! Теперь вы можете войти.';
                document.getElementById('success-modal').classList.add('active');
                setTimeout(() => window.location.href = 'main.html', 2000);
            } catch (e) {
                alert("Ошибка регистрации: " + e.message);
            }
            e.target.reset();
        });

        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                await signInWithEmailAndPassword(auth, email, password);
                document.getElementById('success-title').textContent = 'Вход выполнен!';
                document.getElementById('success-message').textContent = 'Добро пожаловать обратно!';
                document.getElementById('success-modal').classList.add('active');
                setTimeout(() => window.location.href = 'main.html', 2000);
            } catch (e) {
                alert("Ошибка входа: " + e.message);
            }
            e.target.reset();
        });

        document.getElementById('teacher-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('teacher-email').value;
            const password = document.getElementById('teacher-password').value;
            if (email !== teacherEmail) {
                alert("Неверный email учителя!");
                return;
            }
            try {
                await signInWithEmailAndPassword(auth, email, password);
                document.getElementById('success-title').textContent = 'Вход выполнен!';
                document.getElementById('success-message').textContent = 'Добро пожаловать, учитель!';
                document.getElementById('success-modal').classList.add('active');
                setTimeout(() => window.location.href = 'main.html', 2000);
            } catch (e) {
                alert("Ошибка входа: " + e.message);
            }
            e.target.reset();
        });
    }

    if (window.location.pathname.includes('main.html')) {
        const profileBtn = document.getElementById('profile-btn');
        const profileModal = document.getElementById('profile-modal');
        const editProfileModal = document.getElementById('edit-profile-modal');
        const teacherModal = document.getElementById('teacher-modal');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const enrolledCourses = document.getElementById('enrolled-courses');

        async function loadStudentCourses() {
            enrolledCourses.innerHTML = '';
            const q = query(collection(db, "enrollments"), where("userId", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                enrolledCourses.innerHTML = '<li>Вы пока не записаны на курсы</li>';
            } else {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const courseItem = document.createElement('li');
                    courseItem.innerHTML = `
                        ${data.course}: Занятие 1 - ${data.time1}${data.time2 ? `, Занятие 2 - ${data.time2}` : ''} (Статус: ${data.status})
                        <button class="delete-course" data-id="${doc.id}">Удалить</button>
                    `;
                    enrolledCourses.appendChild(courseItem);
                });

                document.querySelectorAll('.delete-course').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const docId = btn.getAttribute('data-id');
                        await deleteDoc(doc(db, "enrollments", docId));
                        document.getElementById('success-title').textContent = 'Запись удалена!';
                        document.getElementById('success-message').textContent = 'Вы успешно отменили запись.';
                        document.getElementById('success-modal').classList.add('active');
                        setTimeout(() => document.getElementById('success-modal').classList.remove('active'), 2000);
                        loadStudentCourses();
                    });
                });
            }
        }

        async function loadTeacherEnrollments() {
            const teacherEnrollments = document.getElementById('teacher-enrollments');
            teacherEnrollments.innerHTML = '';
            const q = query(collection(db, "enrollments"));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                teacherEnrollments.innerHTML = '<li>Заявок на курсы пока нет</li>';
            } else {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const enrollmentItem = document.createElement('li');
                    enrollmentItem.innerHTML = `
                        ${data.userName} (${data.userEmail}): ${data.course}, Занятие 1 - ${data.time1}${data.time2 ? `, Занятие 2 - ${data.time2}` : ''} (Статус: ${data.status})
                        <div>
                            <button class="approve-btn" data-id="${doc.id}" ${data.status !== 'pending' ? 'disabled' : ''}>Подтвердить</button>
                            <button class="reject-btn" data-id="${doc.id}" ${data.status !== 'pending' ? 'disabled' : ''}>Отклонить</button>
                        </div>
                    `;
                    teacherEnrollments.appendChild(enrollmentItem);
                });

                document.querySelectorAll('.approve-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const docId = btn.getAttribute('data-id');
                        await updateDoc(doc(db, "enrollments", docId), { status: 'approved' });
                        loadTeacherEnrollments();
                    });
                });

                document.querySelectorAll('.reject-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const docId = btn.getAttribute('data-id');
                        await updateDoc(doc(db, "enrollments", docId), { status: 'rejected' });
                        loadTeacherEnrollments();
                    });
                });
            }
        }

        profileBtn.addEventListener('click', async () => {
            profileName.textContent = currentUser.displayName || currentUser.email.split('@')[0];
            profileEmail.textContent = currentUser.email;
            if (currentUser.email === teacherEmail) {
                teacherModal.classList.add('active');
                loadTeacherEnrollments();
            } else {
                profileModal.classList.add('active');
                loadStudentCourses();
            }
        });

        document.querySelector('#profile-modal .popup-close').addEventListener('click', () => profileModal.classList.remove('active'));
        document.querySelector('#edit-profile-modal .popup-close').addEventListener('click', () => editProfileModal.classList.remove('active'));
        document.querySelector('#teacher-modal .popup-close').addEventListener('click', () => teacherModal.classList.remove('active'));

        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            document.getElementById('edit-name').value = currentUser.displayName || '';
            editProfileModal.classList.add('active');
        });

        document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = document.getElementById('edit-name').value;
            const newPassword = document.getElementById('edit-password').value;
            if (newName && newName !== currentUser.displayName) await updateProfile(currentUser, { displayName: newName });
            if (newPassword) await updatePassword(currentUser, newPassword);
            document.getElementById('success-title').textContent = 'Профиль обновлён!';
            document.getElementById('success-message').textContent = 'Изменения сохранены.';
            document.getElementById('success-modal').classList.add('active');
            setTimeout(() => {
                document.getElementById('success-modal').classList.remove('active');
                editProfileModal.classList.remove('active');
                profileName.textContent = currentUser.displayName || currentUser.email.split('@')[0];
            }, 2000);
        });

        document.getElementById('logout-btn').addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = 'index.html';
        });

        const courseData = {
            russian: { title: 'Русский язык', description: 'Курс русского языка для всех уровней.' },
            english: { title: 'Английский язык', description: 'От базовой грамматики до свободного общения.' },
            math: { title: 'Математика', description: 'Алгебра, геометрия и основы анализа.' }
        };

        document.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', () => {
                const courseId = card.getAttribute('data-course');
                document.getElementById('popup-title').textContent = courseData[courseId].title;
                document.getElementById('popup-description').textContent = courseData[courseId].description;
                document.getElementById('course-popup').classList.add('active');
            });
        });

        document.querySelector('#course-popup .popup-close').addEventListener('click', () => document.getElementById('course-popup').classList.remove('active'));

        document.querySelector('#course-popup button').addEventListener('click', () => {
            document.getElementById('course-popup').classList.remove('active');
            document.getElementById('schedule-modal').classList.add('active');
        });

        document.querySelector('#schedule-modal .popup-close').addEventListener('click', () => document.getElementById('schedule-modal').classList.remove('active'));

        document.getElementById('course-select').addEventListener('change', function() {
            const selectedCourse = this.value;
            const timeSelect1 = document.getElementById('time-select-1');
            const timeSelect2 = document.getElementById('time-select-2');
            timeSelect1.innerHTML = '<option value="">Выберите время</option>';
            timeSelect2.innerHTML = '<option value="">Выберите время (опционально)</option>';
            if (courseSchedule[selectedCourse]) {
                courseSchedule[selectedCourse].forEach(time => {
                    timeSelect1.innerHTML += `<option value="${time}">${time}</option>`;
                    timeSelect2.innerHTML += `<option value="${time}">${time}</option>`;
                });
            }
        });

        document.getElementById('schedule-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const course = document.getElementById('course-select').value;
            const time1 = document.getElementById('time-select-1').value;
            const time2 = document.getElementById('time-select-2').value;
            if (!course || !time1) {
                alert('Выберите курс и время для Занятия 1');
                return;
            }
            if (time1 === time2 && time2) {
                alert('Выберите разные времена для Занятий');
                return;
            }
            const enrollment = {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userName: currentUser.displayName || currentUser.email.split('@')[0],
                course,
                time1,
                time2: time2 || null,
                enrolledAt: new Date().toISOString(),
                status: 'pending'
            };
            await addDoc(collection(db, "enrollments"), enrollment);
            const message = `Новая запись:\nИмя: ${enrollment.userName}\nEmail: ${enrollment.userEmail}\nКурс: ${course}\nЗанятие 1: ${time1}${time2 ? `\nЗанятие 2: ${time2}` : ''}`;
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${teacherChatId}&text=${encodeURIComponent(message)}`);
            document.getElementById('success-title').textContent = 'Запись подтверждена!';
            document.getElementById('success-message').textContent = `Вы записаны на ${course}.`;
            document.getElementById('success-modal').classList.add('active');
            document.getElementById('schedule-modal').classList.remove('active');
            setTimeout(() => document.getElementById('success-modal').classList.remove('active'), 2000);
            e.target.reset();
        });

        document.getElementById('contact-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            await addDoc(collection(db, "messages"), { name, email, message, createdAt: new Date().toISOString() });
            const telegramMessage = `Новое сообщение:\nИмя: ${name}\nEmail: ${email}\nСообщение: ${message}`;
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${teacherChatId}&text=${encodeURIComponent(telegramMessage)}`);
            document.getElementById('success-title').textContent = 'Сообщение отправлено!';
            document.getElementById('success-message').textContent = 'Мы свяжемся с вами скоро.';
            document.getElementById('success-modal').classList.add('active');
            setTimeout(() => document.getElementById('success-modal').classList.remove('active'), 2000);
            e.target.reset();
        });
    }
});