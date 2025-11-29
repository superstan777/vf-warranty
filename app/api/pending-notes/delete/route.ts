import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.BOT_API_TOKEN}`) {
    return NextResponse.json(
      { success: false, reason: "UNAUTHORIZED" },
      { status: 200 }
    );
  }

  const a = {
    headers: {
      Host: "10.0.6.4:20170",
      "Accept-Encoding": "gzip,deflate",
      "X-Original-Proto": "https",
      "x-ms-origin-endpoint":
        "ppapigw.eu-il106.gateway.prod.island.powerapps.com",
      "X-Original-Host": "10.0.29.12:20017",
      "x-ms-igw-external-uri":
        "https://default8e4ba5a010bd4ab89e4b684eafed53.bd.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/49f135ba7ae249b29fe11aff0a96e166/triggers/When_a_new_chat_message_is_added/versions/08584372650138497281/run?api-version=1&sp=%2Ftriggers%2FWhen_a_new_chat_message_is_added%2Fversions%2F08584372650138497281%2Frun%2C%2Ftriggers%2FWhen_a_new_chat_message_is_added%2Fversions%2F08584372650138497281%2Fread&sv=1.0&sig=1JowugnXetCjHbrnAJ3hbgdAeOZT8J8k8SYQgdNqSRs, https://workflowsmanagementservice.neu-il106.gateway.prod.island.powerapps.com/powerautomate/tenants/00000000-0000-0000-0000-000000000000/environments/Default-8e4ba5a0-10bd-4ab8-9e4b-684eafed53bd/automations/direct/workflows/49f135ba7ae249b29fe11aff0a96e166/triggers/When_a_new_chat_message_is_added/versions/08584372650138497281/run?api-version=1&sp=%2Ftriggers%2FWhen_a_new_chat_message_is_added%2Fversions%2F08584372650138497281%2Frun,%2Ftriggers%2FWhen_a_new_chat_message_is_added%2Fversions%2F08584372650138497281%2Fread&sv=1.0&sig=1JowugnXetCjHbrnAJ3hbgdAeOZT8J8k8SYQgdNqSRs",
      "x-ms-gw-trace-id":
        "4e622723-31c0-4505-8afc-1446a2b53c26, 01007535-0194-43d4-9ffb-ce370041b7c0",
      "x-ms-igw-raw-target":
        "/powerautomate/automations/direct/workflows/49f135ba7ae249b29fe11aff0a96e166/triggers/When_a_new_chat_message_is_added/versions/08584372650138497281/run?api-version=1&sp=%2Ftriggers%2FWhen_a_new_chat_message_is_added%2Fversions%2F08584372650138497281%2Frun%2C%2Ftriggers%2FWhen_a_new_chat_message_is_added%2Fversions%2F08584372650138497281%2Fread&sv=1.0&sig=1JowugnXetCjHbrnAJ3hbgdAeOZT8J8k8SYQgdNqSRs, /powerautomate/tenants/00000000-0000-0000-0000-000000000000/environments/Default-8e4ba5a0-10bd-4ab8-9e4b-684eafed53bd/automations/direct/workflows/49f135ba7ae249b29fe11aff0a96e166/triggers/When_a_new_chat_message_is_added/versions/08584372650138497281/run?api-version=1&sp=%2Ftriggers%2FWhen_a_new_chat_message_is_added%2Fversions%2F08584372650138497281%2Frun,%2Ftriggers%2FWhen_a_new_chat_message_is_added%2Fversions%2F08584372650138497281%2Fread&sv=1.0&sig=1JowugnXetCjHbrnAJ3hbgdAeOZT8J8k8SYQgdNqSRs",
      "x-ms-correlation-id": "ae10ee75-bd65-46d6-971f-96486de40631",
      "x-ms-coreframework-caller-activity-id":
        "31397124-40a3-426f-bfb9-ab72f85a07b2",
      "X-Original-For": "[::ffff:10.0.29.9]:44494",
      "x-ms-ppapi-forwarded-path":
        "/powerautomate/automations/direct/workflows/49f135ba7ae249b29fe11aff0a96e166/triggers/When_a_new_chat_message_is_added/versions/08584372650138497281/run",
      "x-ms-ppapi-forwarded-api-version": "1",
      "x-ms-gateway-clusters": "prdil106weu",
      "X-Forwarded-Prefix":
        "/e8b6479c-caf3-4c5b-ad0c-55c5bbd9c370/134085847188661758",
      "x-ms-activity-vector": "00.00.IN.03",
      "X-Forwarded-For": "::ffff:4.210.130.150",
      "X-Forwarded-Host":
        "workflowsmanagementservice.neu-il106.gateway.prod.island.powerapps.com",
      "X-Forwarded-Proto": "https",
      Forwarded:
        'by=_GB0000003;for="[::ffff:4.210.130.150]";host=workflowsmanagementservice.neu-il106.gateway.prod.island.powerapps.com;proto=https',
      "Content-Type": "application/json",
      "Content-Length": "1186",
    },
    body: {
      value: [
        {
          subscriptionId: "4d22a090-9251-43a8-a5eb-0eb6afb59b12",
          changeType: "created",
          clientState: "secretClientValue",
          subscriptionExpirationDateTime: "2025-12-02T08:58:12.1737117+00:00",
          resource:
            "chats('19:a85fc328-cc1a-4bb1-92b3-e9437b8210b4_d1338e0b-2cab-4163-89a3-4726e025f4f5@unq.gbl.spaces')/messages('1764421322602')",
          resourceData: {
            id: "1764421322602",
            "@odata.type": "#Microsoft.Graph.chatMessage",
            "@odata.id":
              "chats('19:a85fc328-cc1a-4bb1-92b3-e9437b8210b4_d1338e0b-2cab-4163-89a3-4726e025f4f5@unq.gbl.spaces')/messages('1764421322602')",
          },
          tenantId: "8e4ba5a0-10bd-4ab8-9e4b-684eafed53bd",
          conversationId:
            "19:a85fc328-cc1a-4bb1-92b3-e9437b8210b4_d1338e0b-2cab-4163-89a3-4726e025f4f5@unq.gbl.spaces",
          messageId: "1764421322602",
          linkToMessage:
            "https://teams.microsoft.com/l/message/19:a85fc328-cc1a-4bb1-92b3-e9437b8210b4_d1338e0b-2cab-4163-89a3-4726e025f4f5@unq.gbl.spaces/1764421322602?tenantId=8e4ba5a0-10bd-4ab8-9e4b-684eafed53bd&context=%7B%22contextType%22:%22chat%22%7D",
        },
      ],
    },
  };
  try {
    const { user_name } = await req.json();
    if (!user_name) {
      return NextResponse.json(
        { success: false, reason: "MISSING_USER_NAME" },
        { status: 200 }
      );
    }

    const supabase = createClient();

    // Sprawdzenie, czy pending note istnieje
    const { data: existingPending, error: fetchError } = await supabase
      .from("pending_notes")
      .select("*")
      .eq("user_name", user_name)
      .limit(1)
      .single();

    if (fetchError) {
      console.error("Error fetching pending note:", fetchError);
      return NextResponse.json(
        { success: false, reason: "PENDING_FETCH_FAILED" },
        { status: 200 }
      );
    }

    if (!existingPending) {
      return NextResponse.json(
        {
          success: false,
          reason: "NO_PENDING_NOTE",
          message: "No pending note found for this user.",
        },
        { status: 200 }
      );
    }

    // Usunięcie pending note
    const { error: deleteError } = await supabase
      .from("pending_notes")
      .delete()
      .eq("user_name", user_name);

    if (deleteError) {
      console.error("Error deleting pending note:", deleteError);
      return NextResponse.json(
        { success: false, reason: "PENDING_DELETE_FAILED" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Pending note has been successfully deleted." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      { success: false, reason: "UNHANDLED_EXCEPTION" },
      { status: 200 }
    );
  }
}
