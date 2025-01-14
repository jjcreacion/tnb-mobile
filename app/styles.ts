// styles.ts

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative'
  },
  gradient: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0
  },
  abstractShape1: {
    position: 'absolute', 
    top: '20%', 
    right: '30%', 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  abstractShape2: {
    position: 'absolute', 
    bottom: '10%', 
    left: '40%', 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  image: {
    width: 150, 
    height: 150, 
    margin: 10
  },
  text: {
    fontSize: 30, 
    color: '#fff', 
    fontWeight: '600', 
    marginTop: 10
  }
});

export default styles;
