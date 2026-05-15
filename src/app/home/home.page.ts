import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton],
})
export class HomePage {

  constructor(private toastController: ToastController) {
    this.inicializar();
  }

  async inicializar() {
    // 1. Pedir permisos
    await LocalNotifications.requestPermissions();

    // 2. Crear el canal con prioridad alta (esto hace el heads-up) el head up es para que el mensaje se vea cuando te llegue
    await LocalNotifications.createChannel({
      id: 'canal-mensajes',
      name: 'Mensajes',
      importance: 5,        // 5 = IMPORTANCE_HIGH → heads-up
      visibility: 1,        // se ve en lock screen
      sound: 'default',
      vibration: true,
    });
  }

  async pushMostrarNotificacion() {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,// supongo que para tener una lista de notificaciones el id debe ser diferente
          title: 'titulo de la notificacion',
          body: 'mesaje que para que se muestre',
          channelId: 'canal-mensajes',   // ← apunta al canal de alta prioridad
          schedule: {
            at: new Date(Date.now() + 500)  // 500ms así aparece casi instantáneo
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });
  }

  async mostrarNotificacion() {
    const toast = await this.toastController.create({
      message: 'Nueva notificación 🚀',
      duration: 3000,
      position: 'top',
      color: 'success',
      buttons: [{ text: 'Cerrar', role: 'cancel' }]
    });
    await toast.present();
  }
}