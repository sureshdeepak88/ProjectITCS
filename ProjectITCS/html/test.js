<html>
<script>
var employees = "[{\"name\":\"John\", \"lastName\":\"Doe\"},{\"name\":\"Anna\", \"lastName\":\"Smith\"},{\"name\":\"Peter\", \"lastName\": \"Jones\"}]";
newvar = JSON.parse (employees);
alert (newvar.length) ;
for (i=0 ;i < newvar.length ; i++ )
	alert (newvar[i].name) ;
</script>
</html>
