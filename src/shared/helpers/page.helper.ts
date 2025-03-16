import { CreatePageDto } from 'src/modules/pages/dto/page.dto';
import { randomCharacters } from './random.helper';
import { PageRepository } from 'src/modules/pages/repositories/page.repository';
import { EntityManager } from 'typeorm';
import { LanguageRepository } from 'src/modules/languages/repositories/language.repository';
import { ReferenceRepository } from '../repositories/reference.repository';
import { SitieRepository } from 'src/modules/sitie/repositories/sitie.repository';

export async function createPage(
  createPageDto: CreatePageDto,
  cnx: EntityManager,
) {
  const pageRepository = new PageRepository();
  const languageRepository = new LanguageRepository();
  const referenceRepository = new ReferenceRepository();
  const sitieRepository = new SitieRepository();

  const sitie = await sitieRepository.find();
  createPageDto.sitieId = sitie.id;

  const newPage = await pageRepository.create(createPageDto, cnx);

  const languages = await languageRepository.get({
    limit: 99999,
    page: 1,
    search: null,
    status: true,
  });

  const aliasRef: string = randomCharacters('COMBINED', 16);
  const descriptionRef: string = randomCharacters('COMBINED', 16);
  const seoKeywordsRef: string = randomCharacters('COMBINED', 16);

  for (let language of languages.records) {
    await referenceRepository.create(
      {
        ref: aliasRef,
        languageId: language.id,
        text: '',
      },
      cnx,
    );
    await referenceRepository.create(
      {
        ref: descriptionRef,
        languageId: language.id,
        text: '',
      },
      cnx,
    );
    await referenceRepository.create(
      {
        ref: seoKeywordsRef,
        languageId: language.id,
        text: '',
      },
      cnx,
    );
  }

  await pageRepository.createDetails(
    {
      aliasRef,
      descriptionRef,
      seoKeywordsRef,
      pageId: newPage.id,
    },
    cnx,
  );

  return newPage;
}
