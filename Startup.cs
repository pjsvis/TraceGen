using Microsoft.AspNet.SignalR;
using Owin;

namespace Clear2Pay.OTS.UTP.WebApp
{

   //[assembly: OwinStartup(typeof(Clear2Pay.OTS.UTP.WebApp.Startup))]
   public partial class Startup
   {

      public void Configuration(IAppBuilder app)
      {

         //NOTE: We must ConfigureAuth before mapping signalr or we will get a null Context.User.Identity.Name
         ConfigureAuth(app);

         // Enable detailed SignalR error messages
         // Ref: http://stackoverflow.com/questions/19688673/signalr-there-was-an-error-invoking-hub-method-xxx
         var hubConfiguration = new HubConfiguration();
         hubConfiguration.EnableDetailedErrors = true;

         // Ensure correct SignalR reference
         // Ref: http://systemout.net/2014/07/15/signalr-hub-reference-done-right/
         app.MapSignalR("/~/signalr", hubConfiguration);

         // Any connection or hub wire up and configuration should go here  
         // Ref: http://www.asp.net/signalr/overview/guide-to-the-api/hubs-api-guide-javascript-client#crossdomain
         //hubConfiguration.EnableJSONP = true;


      }
   }
}
