import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendRegistrationEmail = async (to: string, nombre: string, documento: string) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ No hay credenciales de email configuradas, saltando envío...');
      return;
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f1a; color: #ffffff; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">¡Bienvenido a DNA Music Academy!</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Nos emociona informarte que tu registro ha sido exitoso. A continuación te enviamos tus datos de acceso al sistema estudiantil:</p>
        <div style="background-color: #1a1a2e; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #6366f1;">
          <p style="margin: 5px 0;"><strong>Usuario/Email:</strong> ${to}</p>
          <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${documento}</p>
        </div>
        <p><em>(Tu contraseña por defecto es tu número de documento)</em></p>
        <p style="text-align: center; margin-top: 30px;">
          <a href="#" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acceder a la plataforma</a>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"DNA Music Academy" <no-reply@dnamusic.co>',
      to,
      subject: '🎵 ¡Bienvenido a DNA Music! Tus credenciales de acceso',
      html: htmlContent,
    });
    console.log(`Correo enviado exitosamente a ${to}`);
  } catch (error) {
    console.error('Error al enviar correo de registro:', error);
  }
};
