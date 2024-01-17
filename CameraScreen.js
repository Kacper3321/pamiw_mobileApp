import React, { Component } from 'react';
import { RNCamera } from 'react-native-camera';
import { View, TouchableOpacity, Text } from 'react-native';

class CameraScreen extends Component {
  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri);
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={{ flex: 1, alignItems: 'center' }}
        >
          <TouchableOpacity onPress={this.takePicture} style={{ flex: 0, alignSelf: 'center' }}>
         <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Take Photo </Text>
         </TouchableOpacity>
         </RNCamera>
         </View>
         );
         }
         }

         export default CameraScreen;
