import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private storage: Storage, private firestore: Firestore) { }

  private async getLocation() {
    const location = await Geolocation.getCurrentPosition();
    return location.coords;
  }
  async takePhoto() {
    const { latitude, longitude } = await this.getLocation();
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100
    });
    if (cameraPhoto.dataUrl) {
      await this.savePhoto(cameraPhoto.dataUrl, latitude, longitude);
    }
  }

  private async savePhoto(dataUrl: string, latitude: number, longitude: number) {
    const name = new Date().getMilliseconds().toString();
    const storageRef = ref(this.storage, name);
    await uploadString(storageRef, dataUrl, 'data_url');
    const photoUrl = await getDownloadURL(storageRef);
    const photoLocation = collection(this.firestore, 'photos');
    await addDoc(photoLocation, {
      url: photoUrl,
      lat: latitude,
      lng: longitude
    })
  }


}
