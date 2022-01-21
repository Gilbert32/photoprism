import { Selector } from "testcafe";
import testcafeconfig from "./testcafeconfig";
import Page from "./page-model";
import Menu from "../page-model/menu";
import Album from "../page-model/album";
import Toolbar from "../page-model/toolbar";
import ContextMenu from "../page-model/context-menu";
import Photo from "../page-model/photo";
import PhotoViewer from "../page-model/photoviewer";
import NewPage from "../page-model/page";
import Subject from "../page-model/subject";
import PhotoViews from "../page-model/photo-views";

fixture.only`Test people`.page`${testcafeconfig.url}`;

const page = new Page();
const menu = new Menu();
const album = new Album();
const toolbar = new Toolbar();
const contextmenu = new ContextMenu();
const photo = new Photo();
const photoviewer = new PhotoViewer();
const newpage = new NewPage();
const subject = new Subject();
const photoviews = new PhotoViews();

test.meta("testID", "people-001")("Add + Rename", async (t) => {
  await menu.openPage("people");
  await t.click(Selector("#tab-people_faces > a"));
  await subject.triggerToolbarAction("reload", "");
  const countFaces = await subject.getFaceCount();
  await t.click(Selector("#tab-people > a"));
  const countSubjects = await subject.getSubjectCount();
  await t.click(Selector("#tab-people_faces > a"));
  const FirstFaceID = await subject.getNthFaceUid(0);
  await subject.openFaceWithUid(FirstFaceID);
  const countPhotosFace = await photo.getPhotoCount("all");
  await menu.openPage("people");
  await t
    .click(Selector("#tab-people_faces > a"))
    .typeText(Selector("div[data-id=" + FirstFaceID + "] div.input-name input"), "Jane Doe")
    .pressKey("enter");
  await subject.triggerToolbarAction("reload");
  const countFacesAfterAdd = await subject.getFaceCount();
  await t
    .expect(countFacesAfterAdd)
    .eql(countFaces - 1)
    .click(Selector("#tab-people > a"));
  await subject.checkFaceVisibility(FirstFaceID, false);
  await t.eval(() => location.reload());
  await t.wait(6000);
  const countSubjectsAfterAdd = await subject.getSubjectCount();
  await t.expect(countSubjectsAfterAdd).eql(countSubjects + 1);
  await toolbar.search("Jane");
  const JaneUID = await subject.getNthSubjectUid(0);
  await t
    .expect(Selector("a[data-uid=" + JaneUID + "] div.caption").innerText)
    .contains(countPhotosFace.toString());
  await subject.openSubjectWithUid(JaneUID);
  const countPhotosSubject = await photo.getPhotoCount("all");
  await t.expect(countPhotosFace).eql(countPhotosSubject);
  await photoviews.triggerHoverAction("nth", 0, "select");
  await photoviews.triggerHoverAction("nth", 1, "select");
  await photoviews.triggerHoverAction("nth", 2, "select");
  await contextmenu.triggerContextMenuAction("edit", "", "");
  await t
    .click(Selector("#tab-people"))
    .expect(Selector("div.input-name input").nth(0).value)
    .contains("Jane Doe")
    .click("button.action-close");
  await menu.openPage("people");
  await t
    .click(Selector("a[data-uid=" + JaneUID + "] div.v-card__title"))
    .typeText(Selector("div.input-rename input"), "Max Mu", { replace: true })
    .pressKey("enter")
    .expect(Selector("a[data-uid=" + JaneUID + "] div.v-card__title").innerText)
    .contains("Max Mu");
  await subject.openSubjectWithUid(JaneUID);
  await t.eval(() => location.reload());
  await contextmenu.checkContextMenuCount("3");
  await contextmenu.triggerContextMenuAction("edit", "", "");
  await t
    .click(Selector("#tab-people"))
    .expect(Selector("div.input-name input").nth(0).value)
    .contains("Max Mu")
    .click(Selector("button.action-next"))
    .expect(Selector("div.input-name input").nth(0).value)
    .contains("Max Mu")
    .click(Selector("button.action-next"))
    .expect(Selector("div.input-name input").nth(0).value)
    .contains("Max Mu")
    .click(Selector("button.action-close"));
  await page.clearSelection();
  await toolbar.search("person:max-mu");
  const countPhotosSubjectAfterRename = await photo.getPhotoCount("all");
  await t.expect(countPhotosSubjectAfterRename).eql(countPhotosSubject);
});

test.meta("testID", "people-002")("Add + Reject + Star", async (t) => {
  await menu.openPage("people");
  await t.click(Selector("#tab-people_faces > a"));
  await subject.triggerToolbarAction("reload");
  const FirstFaceID = await subject.getNthFaceUid(0);
  await t
    .expect(Selector("div.menuable__content__active").nth(0).visible)
    .notOk()
    .click(Selector("div[data-id=" + FirstFaceID + "] div.input-name input"))
    .expect(Selector("div.menuable__content__active").nth(0).visible)
    .ok()
    .typeText(Selector("div[data-id=" + FirstFaceID + "] div.input-name input"), "Andrea Doe")
    .pressKey("enter")
    .click(Selector("#tab-people > a"));
  await toolbar.search("Andrea");
  const AndreaUID = await subject.getNthSubjectUid(0);
  await subject.openSubjectWithUid(AndreaUID);
  await t.eval(() => location.reload());
  await t.wait(5000);
  const countPhotosAndreaAfterAdd = await photo.getPhotoCount("all");
  await photoviews.triggerHoverAction("nth", 1, "select");
  await contextmenu.triggerContextMenuAction("edit", "", "");
  await t
    .click(Selector("#tab-people"))
    .expect(Selector("div.input-name input").nth(0).value)
    .eql("Andrea Doe")
    .click(Selector("div.input-name div.v-input__icon--clear"))
    .expect(Selector("div.input-name input").nth(0).value)
    .eql("")
    .typeText(Selector("div.input-name input").nth(0), "Nicole", { replace: true })
    .pressKey("enter")
    .click("button.action-close");
  await contextmenu.clearSelection();
  await t.eval(() => location.reload());
  await t.wait(5000);
  const countPhotosAndreaAfterReject = await photo.getPhotoCount("all");
  const Diff = countPhotosAndreaAfterAdd - countPhotosAndreaAfterReject;
  await toolbar.search("person:nicole");
  await t.eval(() => location.reload());
  await t.wait(5000);
  const countPhotosNicole = await photo.getPhotoCount("all");
  await t.expect(Diff).gte(countPhotosNicole);
  await menu.openPage("people");
  await toolbar.search("Nicole");
  const NicoleUID = await subject.getNthSubjectUid(0);
  await subject.triggerHoverAction("uid", NicoleUID, "favorite");
  await toolbar.search(" ");
  await t.expect(await subject.getNthSubjectUid(0)).eql(NicoleUID);
});

test.meta("testID", "people-003")("Remove face", async (t) => {
  await toolbar.search("face:new");
  const FirstPhoto = await photo.getNthPhotoUid("all", 0);
  await photoviews.triggerHoverAction("nth", 0, "select");
  await contextmenu.triggerContextMenuAction("edit", "", "");
  await t.click(Selector("#tab-people"));
  const MarkerCount = await subject.getMarkerCount();
  if ((await Selector("div.input-name input").nth(0).value) == "") {
    await t
      .expect(Selector("button.action-undo").nth(0).visible)
      .notOk()
      .expect(Selector("div.input-name input").nth(0).value)
      .eql("")
      .click(Selector("button.input-reject"))
      .expect(Selector("button.action-undo").nth(0).visible)
      .ok()
      .click(Selector("button.action-undo"));
  } else if ((await Selector("div.input-name input").nth(0).value) != "") {
    await t
      .expect(Selector("div.input-name input").nth(1).value)
      .eql("")
      .click(Selector("button.input-reject"))
      .expect(Selector("button.action-undo").nth(0).visible)
      .ok()
      .click(Selector("button.action-undo"));
  }
  await t.click("button.action-close");
  await contextmenu.clearSelection();
  await t.eval(() => location.reload());
  await t.wait(5000);
  await photoviews.triggerHoverAction("uid", FirstPhoto, "select");
  await contextmenu.triggerContextMenuAction("edit", "", "");
  await t.click(Selector("#tab-people"));
  if ((await Selector("div.input-name input").nth(0).value) == "") {
    await t
      .expect(Selector("button.action-undo").nth(0).visible)
      .notOk()
      .expect(Selector("div.input-name input").nth(0).value)
      .eql("")
      .click(Selector("button.input-reject"))
      .expect(Selector("button.action-undo").nth(0).visible)
      .ok();
  } else if ((await Selector("div.input-name input").nth(0).value) != "") {
    await t
      .expect(Selector("button.action-undo").nth(0).visible)
      .notOk()
      .expect(Selector("div.input-name input").nth(1).value)
      .eql("")
      .click(Selector("button.input-reject"))
      .expect(Selector("button.action-undo").nth(0).visible)
      .ok();
  }
  await t.click("button.action-close");
  await t.eval(() => location.reload());
  await contextmenu.triggerContextMenuAction("edit", "", "");
  await t.click(Selector("#tab-people"));
  const MarkerCountAfterRemove = await subject.getMarkerCount();
  await t.expect(MarkerCountAfterRemove).eql(MarkerCount - 1);
});

test.meta("testID", "people-004")("Hide face", async (t) => {
  await menu.openPage("people");
  await t.click(Selector("#tab-people_faces > a"));
  await subject.triggerToolbarAction("reload");
  const FirstFaceID = await subject.getNthFaceUid(0);
  await subject.checkFaceVisibility(FirstFaceID, true);
  await subject.triggerHoverAction("id", FirstFaceID, "hidden");
  await t.eval(() => location.reload());
  await t.wait(5000);
  await subject.checkFaceVisibility(FirstFaceID, false);
  await subject.triggerToolbarAction("show-hidden");
  await t.eval(() => location.reload());
  await t.wait(6000);
  await subject.checkFaceVisibility(FirstFaceID, true);
  await subject.triggerHoverAction("id", FirstFaceID, "hidden");
  await subject.triggerToolbarAction("exclude-hidden");
  await t.eval(() => location.reload());
  await t.wait(6000);
  await subject.checkFaceVisibility(FirstFaceID, true);
});

test.meta("testID", "people-005")("Hide person", async (t) => {
  await menu.openPage("people");
  await t.click(Selector("#tab-people > a"));
  const FirstPerson = await subject.getNthSubjectUid(0);
  await subject.checkSubjectVisibility("uid", FirstPerson, true);
  await subject.triggerHoverAction("uid", FirstPerson, "hidden");
  await t.eval(() => location.reload());
  await t.wait(6000);
  await subject.checkSubjectVisibility("uid", FirstPerson, false);
  await subject.triggerToolbarAction("show-hidden");
  await t.eval(() => location.reload());
  await t.wait(6000);
  await subject.checkSubjectVisibility("uid", FirstPerson, true);
  await subject.triggerHoverAction("uid", FirstPerson, "hidden");
  await subject.triggerToolbarAction("exclude-hidden");
  await t.eval(() => location.reload());
  await t.wait(5000);
  await subject.checkSubjectVisibility("uid", FirstPerson, true);
});