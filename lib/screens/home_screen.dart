import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/route_plan.dart';
import '../services/auth_service.dart';
import '../services/location_service.dart';
import '../services/directions_service.dart';
import '../services/trip_service.dart';
import '../models/trip_model.dart';
import 'destination_search_screen.dart';
import 'live_navigation_screen.dart';
import 'profile_settings_screen.dart';
import '../widgets/promotional_video_header.dart';

class HomeScreen extends StatefulWidget {
 const HomeScreen({super.key});
 @override State<HomeScreen> createState()=>_HomeScreenState();
}
class _HomeScreenState extends State<HomeScreen>{
 int _tab=0; bool _busy=false;
 final _location=LocationService(),_directions=DirectionsService(),_trips=TripService();
 Future<void> _start({bool planned=false,String? existingTrip}) async{
  final suggestion=await Navigator.push<PlaceSuggestion>(context,MaterialPageRoute(builder:(_)=>const DestinationSearchScreen()));
  if(suggestion==null||!mounted)return;
  setState(()=>_busy=true);
  try{
   final dest=await _directions.placeCoordinates(suggestion.placeId);
   final pos=await _location.currentPosition();
   final plan=await _directions.directions(originLat:pos.latitude,originLng:pos.longitude,
    destinationLat:dest.lat,destinationLng:dest.lng,destinationName:suggestion.description);
   final tripId=existingTrip??await _trips.createTrip(planned?'Planned: ${suggestion.description}':'Quick trip: ${suggestion.description}');
   if(!mounted)return;
   await Navigator.push(context,MaterialPageRoute(builder:(_)=>LiveNavigationScreen(tripId:tripId,plan:plan)));
  }catch(e){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('$e')));}
  finally{if(mounted)setState(()=>_busy=false);}
 }
 Future<void> _join()async{
  final c=TextEditingController();
  final code=await showDialog<String>(context:context,builder:(ctx)=>AlertDialog(title:const Text('Join a convoy'),
   content:TextField(controller:c,textCapitalization:TextCapitalization.characters,decoration:const InputDecoration(labelText:'6-character invite code')),
   actions:[TextButton(onPressed:()=>Navigator.pop(ctx),child:const Text('Cancel')),FilledButton(onPressed:()=>Navigator.pop(ctx,c.text.trim()),child:const Text('Join'))]));
  c.dispose();if(code==null||code.isEmpty)return;
  setState(()=>_busy=true);
  try{final id=await _trips.joinTrip(code);if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('Joined convoy $id. Choose a destination to navigate.')));}
  catch(e){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('$e')));}
  finally{if(mounted)setState(()=>_busy=false);}
 }
 @override Widget build(BuildContext context){
  final user=AuthService().currentUser;
  final pages=[_dashboard(user?.displayName??user?.email??'Traveller'),_tripsPage(),const ProfileSettingsScreen()];
  return Scaffold(body:SafeArea(child:pages[_tab]),bottomNavigationBar:NavigationBar(selectedIndex:_tab,
   onDestinationSelected:(v)=>setState(()=>_tab=v),destinations:const [
    NavigationDestination(icon:Icon(Icons.home_outlined),selectedIcon:Icon(Icons.home),label:'Home'),
    NavigationDestination(icon:Icon(Icons.route_outlined),selectedIcon:Icon(Icons.route),label:'My Trips'),
    NavigationDestination(icon:Icon(Icons.person_outline),selectedIcon:Icon(Icons.person),label:'Profile'),
   ]));
 }
 Widget _dashboard(String name)=>ListView(padding:const EdgeInsets.all(18),children:[
  Row(children:[const Icon(Icons.navigation,color:Color(0xff00dce8),size:34),const SizedBox(width:8),
   const Text('Route',style:TextStyle(fontSize:24,fontWeight:FontWeight.bold)),const Text('Mitra',style:TextStyle(fontSize:24,fontWeight:FontWeight.bold,color:Color(0xff00dce8))),
   const Spacer(),IconButton(onPressed:()=>AuthService().signOut(),icon:const Icon(Icons.logout))]),
  const SizedBox(height:10),
  Text('Hi, $name 👋',style:const TextStyle(fontSize:24,fontWeight:FontWeight.bold)),
  const Text('Travel together. Stay connected.',style:TextStyle(color:Colors.white70)),
  const SizedBox(height:18),
  const PromotionalVideoHeader(),
  const SizedBox(height:22),const Text('Start your journey',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold)),
  const SizedBox(height:12),
  Row(children:[Expanded(child:_action(Icons.bolt,'Quick Trip','Go now',()=>_start())),
   const SizedBox(width:10),Expanded(child:_action(Icons.event_note,'Planned Trip','Choose destination',()=>_start(planned:true)))]),
  const SizedBox(height:10),_action(Icons.group_add,'Join Trip','Enter an invite code',_join,wide:true),
  const SizedBox(height:22),const Text('Joined & active trips',style:TextStyle(fontSize:20,fontWeight:FontWeight.bold)),
  StreamBuilder<List<TripModel>>(stream:_trips.myActiveTrips(),builder:(context,s){
   if(s.hasError)return Text('Unable to load trips: ${s.error}');
   if(!s.hasData)return const Padding(padding:EdgeInsets.all(20),child:Center(child:CircularProgressIndicator()));
   if(s.data!.isEmpty)return const Padding(padding:EdgeInsets.all(12),child:Text('No active trips yet. Create or join a trip to see it here.',style:TextStyle(color:Colors.white70)));
   return Column(children:s.data!.map((t)=>Card(color:const Color(0xff142b43),child:ListTile(
    leading:const CircleAvatar(child:Icon(Icons.directions_car)),title:Text(t.name),
    subtitle:Text('Invite code: ${t.code}'),trailing:const Icon(Icons.chevron_right),
    onTap:()=>_start(existingTrip:t.id))).toList());
  }),
  if(_busy)const LinearProgressIndicator(),
 ]);
 Widget _tripsPage()=>Scaffold(backgroundColor:Colors.transparent,appBar:AppBar(title:const Text('My Trips')),
  body:StreamBuilder<List<TripModel>>(stream:_trips.myActiveTrips(),builder:(context,s){
   if(!s.hasData)return const Center(child:CircularProgressIndicator());
   if(s.data!.isEmpty)return const Center(child:Text('No trips yet'));
   return ListView(children:s.data!.map((t)=>ListTile(leading:const Icon(Icons.map),title:Text(t.name),subtitle:Text(t.code),
    trailing:const Icon(Icons.arrow_forward_ios,size:16),onTap:()=>_start(existingTrip:t.id))).toList());
  }));
 Widget _action(IconData icon,String title,String sub,VoidCallback tap,{bool wide=false})=>Card(
  color:const Color(0xff12334c),child:ListTile(onTap:_busy?null:tap,leading:Icon(icon,color:const Color(0xff00dce8),size:30),
   title:Text(title,style:const TextStyle(fontWeight:FontWeight.bold)),subtitle:Text(sub),
   trailing:const Icon(Icons.arrow_forward),contentPadding:const EdgeInsets.all(14)));
}
